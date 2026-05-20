from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Book, User, Transaction, TransactionStatus
from app.schemas import BorrowRequest, TransactionResponse
from datetime import datetime, timedelta
from typing import List
from sqlalchemy import func
from app.auth import get_current_user
from app.models import User
router = APIRouter()

@router.post("/borrow", response_model=TransactionResponse)
def borrow_book(
    request: BorrowRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Replace request.user_id with current_user.user_id
    existing = db.query(Transaction).filter(
        Transaction.user_id == current_user.user_id,
        Transaction.book_id == request.book_id,
        Transaction.status  == TransactionStatus.active
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You already have this book borrowed")
    #PESSIMISTIC LOCKING
    book = db.query(Book).filter(
        Book.book_id == request.book_id
    ).with_for_update().first()

    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    if book.available_licenses <= 0:
        raise HTTPException(status_code=409, detail=f"No licenses available.")

    book.available_licenses -= 1
    transaction = Transaction(
        user_id     = current_user.user_id,
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
    transactions = db.query(Transaction).filter(
        Transaction.user_id == user_id
    ).all()
    return transactions

@router.get("/user/{user_id}/fines")
def get_user_fines(user_id: int, db: Session = Depends(get_db)):
    now = datetime.utcnow()
    active = db.query(Transaction).filter(
        Transaction.user_id == user_id,
        Transaction.status  == TransactionStatus.active,
        Transaction.due_date < now
    ).all()

    total_fine = 0
    fines = []
    for t in active:
        days_overdue = (now - t.due_date).days
        fine = days_overdue * 1  # ₹1 per day
        total_fine += fine
        fines.append({
            "transaction_id": t.transaction_id,
            "book_id":        t.book_id,
            "due_date":       t.due_date,
            "days_overdue":   days_overdue,
            "fine_amount":    fine
        })

    return {
        "user_id":    user_id,
        "total_fine": total_fine,
        "currency":   "INR",
        "details":    fines
    }

@router.get("/overdue")
def get_overdue(db: Session = Depends(get_db)):
    now     = datetime.utcnow()
    overdue = db.query(Transaction).filter(
        Transaction.status   == TransactionStatus.active,
        Transaction.due_date <  now
    ).all()
    for t in overdue:
        t.status = TransactionStatus.overdue
    db.commit()
    return {
        "overdue_count": len(overdue),
        "transactions": [
            {
                "transaction_id": t.transaction_id,
                "user_id":        t.user_id,
                "book_id":        t.book_id,
                "due_date":       t.due_date,
                "days_overdue":   (now - t.due_date).days
            }
            for t in overdue
        ]
    }

@router.get("/dashboard/stats")
def dashboard_stats(db: Session = Depends(get_db)):
    from app.cache import book_cache

    total_books    = db.query(Book).count()
    total_users    = db.query(User).count()
    active_borrows = db.query(Transaction).filter(
        Transaction.status == TransactionStatus.active
    ).count()

    popular = db.query(
        Book.title,
        func.count(Transaction.transaction_id).label("cnt")
    ).join(Transaction)\
     .group_by(Book.book_id)\
     .order_by(func.count(Transaction.transaction_id).desc())\
     .limit(5).all()

    return {
        "total_books":    total_books,
        "total_users":    total_users,
        "active_borrows": active_borrows,
        "cache_stats":    book_cache.stats(),
        "popular_books":  [
            {"title": t, "borrow_count": c} for t, c in popular
        ]
    }