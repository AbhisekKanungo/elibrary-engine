from fastapi import FastAPI
from app.database import engine, Base
from app.routers import users, books

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="E-Library Engine",
    description="High-Concurrency Digital Library System",
    version="1.0.0"
)

# Connect the User logic
app.include_router(users.router)

# Connect the Books logic
app.include_router(books.router)

@app.get("/")
def root():
    return {"message": "E-Library Engine is running"}