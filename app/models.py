from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    user_id    = Column(Integer, primary_key=True, index=True)
    name       = Column(String(100), nullable=False)
    email      = Column(String(100), unique=True, nullable=False)
    user_type  = Column(String(20), default="student")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    transactions = relationship("Transaction", back_populates="user")

class Book(Base):
    __tablename__ = "books"
    book_id            = Column(Integer, primary_key=True, index=True)
    title              = Column(String(300), nullable=False)
    author             = Column(String(200), nullable=False)
    total_licenses     = Column(Integer, default=5)
    available_licenses = Column(Integer, default=5)
    
    transactions = relationship("Transaction", back_populates="book")

class Transaction(Base):
    __tablename__ = "transactions"
    transaction_id = Column(Integer, primary_key=True, index=True)
    user_id        = Column(Integer, ForeignKey("users.user_id"))
    book_id        = Column(Integer, ForeignKey("books.book_id"))
    borrow_date    = Column(DateTime, default=datetime.utcnow)
    status         = Column(String(20), default="active")

    user = relationship("User", back_populates="transactions")
    book = relationship("Book", back_populates="transactions")