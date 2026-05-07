from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.models import UserType, TransactionStatus

class UserCreate(BaseModel):
    name: str
    email: str
    user_type: UserType = UserType.student

class UserResponse(BaseModel):
    user_id: int
    name: str
    email: str
    user_type: UserType
    created_at: datetime
    class Config:
        from_attributes = True

class BookCreate(BaseModel):
    title: str
    author: str
    isbn: Optional[str] = None
    category: Optional[str] = None
    total_licenses: int = 5
    description: Optional[str] = None
    cover_url: Optional[str] = None

class BookResponse(BaseModel):
    book_id: int
    title: str
    author: str
    isbn: Optional[str]
    category: Optional[str]
    total_licenses: int
    available_licenses: int
    description: Optional[str]
    cover_url: Optional[str]
    class Config:
        from_attributes = True

class BorrowRequest(BaseModel):
    user_id: int
    book_id: int

class TransactionResponse(BaseModel):
    transaction_id: int
    user_id: int
    book_id: int
    borrow_date: datetime
    due_date: Optional[datetime]
    status: TransactionStatus
    class Config:
        from_attributes = True