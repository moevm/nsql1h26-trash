"""
Тесты: GET /admin/backup/export и POST /admin/backup/import.

Покрываемые сценарии:
  Экспорт (Export):
    - Возвращает файл JSON (Content-Disposition: attachment)
    - Пропускает системные коллекции (начинаются с '_')
    - Включает пользовательские коллекции
    - Документы из коллекций попадают в дамп
    - Пустая БД → пустой JSON-объект {}
    - Доступ без авторизации → 401

  Импорт (Import):
    - Валидный JSON — данные вставляются
    - Поля _id и _rev удаляются из документов перед вставкой
    - Поле _key сохраняется (нужно для overwrite)
    - Несуществующая коллекция создаётся
    - Неверный формат JSON → 400
    - Не-словарь в JSON → 400
    - Значение коллекции — не список → пропускается
    - Ошибка при вставке → 500 с описанием
    - Доступ без авторизации → 401
"""

import json
import io
import pytest
from unittest.mock import call, MagicMock
from tests.conftest import cursor

EXPORT_BASE = "/admin/backup/export"
IMPORT_BASE = "/admin/backup/import"


def _upload_json(client, data: dict):
    """Отправляет JSON как multipart/form-data файл."""
    content = json.dumps(data).encode()
    return client.post(
        IMPORT_BASE,
        files={"file": ("backup.json", io.BytesIO(content), "application/json")},
    )

class TestAdminBackupExport:

    def test_returns_200(self, admin_client, mock_db):
        resp = admin_client.get(EXPORT_BASE)
        assert resp.status_code == 200

    def test_content_type_is_json(self, admin_client, mock_db):
        resp = admin_client.get(EXPORT_BASE)
        assert "application/json" in resp.headers["content-type"]

    def test_content_disposition_is_attachment(self, admin_client, mock_db):
        resp = admin_client.get(EXPORT_BASE)
        assert "attachment" in resp.headers.get("content-disposition", "")
        assert "backup.json" in resp.headers.get("content-disposition", "")

    def test_empty_db_returns_empty_dict(self, admin_client, mock_db):
        mock_db.collections.return_value = []
        data = admin_client.get(EXPORT_BASE).json()
        assert data == {}

    def test_system_collections_excluded(self, admin_client, mock_db):
        mock_db.collections.return_value = [
            {"name": "_system"},
            {"name": "_graphs"},
            {"name": "Users"},
        ]
        mock_db.collection.return_value.all.return_value = cursor()
        data = admin_client.get(EXPORT_BASE).json()
        assert "_system" not in data
        assert "_graphs" not in data
        assert "Users" in data

    def test_user_collections_included(self, admin_client, mock_db):
        mock_db.collections.return_value = [
            {"name": "Users"},
            {"name": "Orders"},
            {"name": "Events"},
        ]
        mock_db.collection.return_value.all.return_value = cursor()
        data = admin_client.get(EXPORT_BASE).json()
        assert "Users" in data
        assert "Orders" in data
        assert "Events" in data

    def test_documents_included_in_dump(self, admin_client, mock_db):
        doc = {"_key": "u1", "_id": "Users/u1", "full_name": "Иван"}
        mock_db.collections.return_value = [{"name": "Users"}]
        mock_db.collection.return_value.all.return_value = cursor(doc)
        data = admin_client.get(EXPORT_BASE).json()
        assert len(data["Users"]) == 1
        assert data["Users"][0]["_key"] == "u1"

    def test_multiple_docs_in_collection(self, admin_client, mock_db):
        docs = [
            {"_key": "u1", "name": "Иван"},
            {"_key": "u2", "name": "Пётр"},
        ]
        mock_db.collections.return_value = [{"name": "Users"}]
        mock_db.collection.return_value.all.return_value = cursor(*docs)
        data = admin_client.get(EXPORT_BASE).json()
        assert len(data["Users"]) == 2

    def test_without_token_returns_401(self, unauth_client):
        resp = unauth_client.get(EXPORT_BASE)
        assert resp.status_code == 401


class TestAdminBackupImport:

    def test_valid_import_returns_200(self, admin_client, mock_db):
        data = {"Users": [{"_key": "u1", "name": "Иван"}]}
        resp = _upload_json(admin_client, data)
        assert resp.status_code == 200

    def test_valid_import_success_message(self, admin_client, mock_db):
        data = {"Users": [{"_key": "u1"}]}
        resp = _upload_json(admin_client, data)
        assert resp.json()["message"] == "Данные успешно восстановлены"

    def test_id_and_rev_stripped_before_insert(self, admin_client, mock_db):
        """_id и _rev не должны передаваться в insert."""
        doc = {"_key": "u1", "_id": "Users/u1", "_rev": "_abcXYZ", "name": "Иван"}
        _upload_json(admin_client, {"Users": [doc]})

        inserted_doc = mock_db.collection.return_value.insert.call_args[0][0]
        assert "_id" not in inserted_doc
        assert "_rev" not in inserted_doc

    def test_key_preserved_after_strip(self, admin_client, mock_db):
        """_key должен остаться — он нужен для overwrite."""
        doc = {"_key": "u1", "_id": "Users/u1", "_rev": "_abc", "name": "Иван"}
        _upload_json(admin_client, {"Users": [doc]})

        inserted_doc = mock_db.collection.return_value.insert.call_args[0][0]
        assert inserted_doc["_key"] == "u1"

    def test_payload_fields_preserved(self, admin_client, mock_db):
        doc = {"_key": "u1", "_id": "Users/u1", "_rev": "_abc",
               "full_name": "Иван", "role": "customer"}
        _upload_json(admin_client, {"Users": [doc]})

        inserted_doc = mock_db.collection.return_value.insert.call_args[0][0]
        assert inserted_doc["full_name"] == "Иван"
        assert inserted_doc["role"] == "customer"

    def test_collection_truncated_before_insert(self, admin_client, mock_db):
        """Коллекция должна усекаться перед вставкой для полного восстановления."""
        doc = {"_key": "u1", "name": "Иван"}
        _upload_json(admin_client, {"Users": [doc]})
        mock_db.collection.return_value.truncate.assert_called()

    def test_multiple_docs_all_inserted(self, admin_client, mock_db):
        docs = [{"_key": f"u{i}"} for i in range(3)]
        _upload_json(admin_client, {"Users": docs})
        assert mock_db.collection.return_value.insert.call_count == 3

    def test_multiple_collections_all_processed(self, admin_client, mock_db):
        data = {
            "Users": [{"_key": "u1"}],
            "Orders": [{"_key": "o1"}, {"_key": "o2"}],
        }
        _upload_json(admin_client, data)
        assert mock_db.collection.return_value.insert.call_count == 3

    def test_missing_collection_is_created(self, admin_client, mock_db):
        mock_db.has_collection.return_value = False
        _upload_json(admin_client, {"NewCollection": [{"_key": "x1"}]})
        mock_db.create_collection.assert_called_once_with("NewCollection")

    def test_existing_collection_not_recreated(self, admin_client, mock_db):
        mock_db.has_collection.return_value = True
        _upload_json(admin_client, {"Users": [{"_key": "u1"}]})
        mock_db.create_collection.assert_not_called()

    def test_collection_value_not_a_list_is_skipped(self, admin_client, mock_db):
        """Если значение коллекции — не список, она пропускается без ошибки."""
        resp = _upload_json(admin_client, {"Users": "not_a_list"})
        assert resp.status_code == 200
        mock_db.collection.return_value.insert.assert_not_called()

    def test_invalid_json_returns_400(self, admin_client, mock_db):
        resp = admin_client.post(
            IMPORT_BASE,
            files={"file": ("backup.json", b"{ not valid json }", "application/json")},
        )
        assert resp.status_code == 400
        assert "Ошибка формата" in resp.json()["detail"]

    def test_json_array_instead_of_dict_returns_400(self, admin_client, mock_db):
        resp = admin_client.post(
            IMPORT_BASE,
            files={"file": ("backup.json", b"[1, 2, 3]", "application/json")},
        )
        assert resp.status_code == 400

    def test_db_error_returns_500(self, admin_client, mock_db):
        mock_db.has_collection.return_value = True
        mock_db.collection.return_value.insert.side_effect = Exception("DB failure")
        resp = _upload_json(admin_client, {"Users": [{"_key": "u1"}]})
        assert resp.status_code == 500
        assert "Критическая ошибка" in resp.json()["detail"]

    def test_without_token_returns_401(self, unauth_client):
        resp = _upload_json(unauth_client, {"Users": []})
        assert resp.status_code == 401
