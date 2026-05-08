from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Book, User, Transaction, TransactionStatus
from app.schemas import BorrowRequest, TransactionResponse
from datetime import datetime, timedelta
from typing import List

router = APIRouter()

@router.post("/borrow", response_model=TransactionResponse)
def borrow_book(request: BorrowRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.user_id == request.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    existing = db.query(Transaction).filter(
        Transaction.user_id == request.user_id,
        Transaction.book_id == request.book_id,
        Transaction.status  == TransactionStatus.active
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You already have this book borrowed")

    # PESSIMISTIC LOCK — this row is locked until we commit
    book = db.query(Book).filter(
        Book.book_id == request.book_id
    ).with_for_update().first()

    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    if book.available_licenses <= 0:
        raise HTTPException(status_code=409, detail=f"No licenses available. All {book.total_licenses} copies are borrowed.")

    book.available_licenses -= 1
    transaction = Transaction(
        user_id     = request.user_id,
        book_id     = request.book_id,
        borrow_date = datetime.utcnow(),
        due_date    = datetime.utcnow() + timedelta(days=14),
        status      = TransactionStatus.active
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction

@router.post("/return/{transaction_id}")
def return_book(transaction_id: int, db: Session = Depends(get_db)):
    transaction = db.query(Transaction).filter(
        Transaction.transaction_id == transaction_id
    ).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    if transaction.status == TransactionStatus.returned:
        raise HTTPException(status_code=400, detail="Book already returned")

    book = db.query(Book).filter(
        Book.book_id == transaction.book_id
    ).with_for_update().first()

    book.available_licenses += 1
    transaction.status      = TransactionStatus.returned
    transaction.return_date = datetime.utcnow()
    db.commit()
    return {"message": "Book returned successfully", "transaction_id": transaction_id}

@router.get("/active", response_model=List[TransactionResponse])
def get_active(db: Session = Depends(get_db)):
    return db.query(Transaction).filter(
        Transaction.status == TransactionStatus.active
    ).all()

@router.get("/user/{user_id}", response_model=List[TransactionResponse])
def get_user_transactions(user_id: int, db: Session = Depends(get_db)):
    return db.query(Transaction).filter(
        Transaction.user_id == user_id
    ).all()