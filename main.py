from fastapi import FastAPI
from app.database import engine, Base
from app.routers import users, books, transactions

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="E-Library Engine",
    description="High-Concurrency Digital Library System",
    version="1.0.0"
)

app.include_router(users.router,        prefix="/users",        tags=["Users"])
app.include_router(books.router,        prefix="/books",        tags=["Books"])
app.include_router(transactions.router, prefix="/transactions", tags=["Transactions"])

@app.get("/")
def root():
    return {"message": "E-Library Engine is running"}