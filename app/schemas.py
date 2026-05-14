from pydantic import BaseModel, EmailStr, field_validator, ConfigDict
from datetime import datetime
from typing import Optional
from app.models import UserType, TransactionStatus

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    user_type: UserType = UserType.student

class UserResponse(BaseModel):
    user_id: int
    name: str
    email: str
    user_type: UserType
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class BookCreate(BaseModel):
    title: str
    author: str
    isbn: Optional[str] = None
    category: Optional[str] = None
    total_licenses: int = 5
    available_licenses: Optional[int] = None # Added this
    description: Optional[str] = None
    cover_url: Optional[str] = None
    @field_validator('available_licenses', mode='before')
    @classmethod
    def set_available_licenses(cls, v, info):
        total = info.data.get('total_licenses', 5)
        if v is None:
            return total
        if v > total:
            raise ValueError(f"Available licenses ({v}) cannot exceed total ({total})")
        return v

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
    model_config = ConfigDict(from_attributes=True)

class BorrowRequest(BaseModel):
    book_id: int

class TransactionResponse(BaseModel):
    transaction_id: int
    user_id: int
    book_id: int
    borrow_date: datetime
    due_date: Optional[datetime]
    status: TransactionStatus
    model_config = ConfigDict(from_attributes=True)