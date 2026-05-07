from fastapi import FastAPI
from app.database import engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="E-Library Engine",
    description="High-Concurrency Digital Library System",
    version="1.0.0"
)

@app.get("/")
def root():
    return {"message": "E-Library Engine is running"}