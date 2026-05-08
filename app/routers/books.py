from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models import Book
from app.schemas import BookCreate, BookResponse
from typing import List, Optional
from app.cache import book_cache
import logging
logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/", response_model=BookResponse)
def create_book(book: BookCreate, db: Session = Depends(get_db)):
    db_book = Book(**book.dict())
    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    return db_book

@router.get("/search", response_model=List[BookResponse])
def search_books(
    q:              Optional[str]  = Query(None),
    author:         Optional[str]  = Query(None),
    category:       Optional[str]  = Query(None),
    available_only: bool           = False,
    db: Session = Depends(get_db)
):
    query = db.query(Book)
    if q:
        query = query.filter(
            or_(Book.title.ilike(f"%{q}%"), Book.author.ilike(f"%{q}%"))
        )
    if author:
        query = query.filter(Book.author.ilike(f"%{author}%"))
    if category:
        query = query.filter(Book.category.ilike(f"%{category}%"))
    if available_only:
        query = query.filter(Book.available_licenses > 0)
    return query.limit(50).all()

@router.get("/", response_model=List[BookResponse])
def get_all_books(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    return db.query(Book).offset(skip).limit(limit).all()

@router.get("/cache/stats")
def cache_stats():
    return book_cache.stats()

@router.get("/{book_id}", response_model=BookResponse)
def get_book(book_id: int, db: Session = Depends(get_db)):
    cache_key = f"book:{book_id}"

    cached = book_cache.get(cache_key)
    if cached:
        logger.info(f"[CACHE HIT] book_id={book_id}")
        return cached

    logger.info(f"[CACHE MISS] book_id={book_id} — querying DB")
    book = db.query(Book).filter(Book.book_id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    book_dict = {
        "book_id":            book.book_id,
        "title":              book.title,
        "author":             book.author,
        "isbn":               book.isbn,
        "category":           book.category,
        "total_licenses":     book.total_licenses,
        "available_licenses": book.available_licenses,
        "description":        book.description,
        "cover_url":          book.cover_url
    }
    book_cache.set(cache_key, book_dict)
    return book

@router.put("/{book_id}", response_model=BookResponse)
def update_book(book_id: int, book_data: BookCreate, db: Session = Depends(get_db)):
    book = db.query(Book).filter(Book.book_id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    for key, value in book_data.dict().items():
        setattr(book, key, value)
    db.commit()
    db.refresh(book)
    return book

@router.delete("/{book_id}")
def delete_book(book_id: int, db: Session = Depends(get_db)):
    book = db.query(Book).filter(Book.book_id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    db.delete(book)
    db.commit()
    return {"message": "Book deleted"}