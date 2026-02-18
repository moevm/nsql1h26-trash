from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {
        "status": "Success",
        "message": "Hello World",
        "role": "Admin/Courier/Client API"
    }

@app.get("/health")
def health_check():
    return {"status": "alive"}