#!/bin/bash

docker compose down -v;

docker compose build --no-cache backend;
docker compose build --no-cache db;

docker compose up -d;

echo "Restart was completed"