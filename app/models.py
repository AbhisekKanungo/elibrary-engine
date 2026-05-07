from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime
import enum

class UserType(str, enum.Enum):
    student = "student"
    faculty = "faculty"
    admin   = "admin"

class TransactionStatus(str, enum.Enum):
    active   = "active"
    returned = "returned"
    overdue  = "overdue"

class User(Base):
    __tablename__ = "users"
    user_id    = Column(Integer, primary_key=True, index=True)
    name       = Column(String(100), nullable=False)
    email      = Column(String(100), unique=True, nullable=False)
    user_type  = Column(Enum(UserType), default=UserType.student)
    created_at = Column(DateTime, default=datetime.utcnow)
    transactions = relationship("Transaction", back_populates="user")

class Book(Base):
    __tablename__ = "books"
    book_id            = Column(Integer, primary_key=True, index=True)
    title              = Column(String(300), nullable=False)
    author             = Column(String(200), nullable=False)
    isbn               = Column(String(20), unique=True, nullable=True)
    category           = Column(String(100))
    total_licenses     = Column(Integer, default=5)
    available_licenses = Column(Integer, default=5)
    description        = Column(Text)
    cover_url          = Column(String(500))
    created_at         = Column(DateTime, default=datetime.utcnow)
    content      = relationship("BookContent", back_populates="book", uselist=False)
    transactions = relationship("Transaction", back_populates="book")

class BookContent(Base):
    __tablename__ = "book_content"
    content_id      = Column(Integer, primary_key=True, index=True)
    book_id         = Column(Integer, ForeignKey("books.book_id"), unique=True)
    file_path       = Column(String(500))
    file_size_bytes = Column(Integer)
    file_url        = Column(String(500))
    book = relationship("Book", back_populates="content")

class Transaction(Base):
    __tablename__ = "transactions"
    transaction_id = Column(Integer, primary_key=True, index=True)
    user_id        = Column(Integer, ForeignKey("users.user_id"))
    book_id        = Column(Integer, ForeignKey("books.book_id"))
    borrow_date    = Column(DateTime, default=datetime.utcnow)
    due_date       = Column(DateTime)
    return_date    = Column(DateTime, nullable=True)
    status         = Column(Enum(TransactionStatus), default=TransactionStatus.active)
    user = relationship("User", back_populates="transactions")
    book = relationship("Book", back_populates="transactions")