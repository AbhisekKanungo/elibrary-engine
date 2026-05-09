import networkx as nx
from sqlalchemy.orm import Session
from app.models import Transaction, Book
from typing import List, Dict
from collections import defaultdict
import logging

logger = logging.getLogger(__name__)

def build_user_book_graph(db: Session) -> nx.Graph:
    """
    Bipartite Graph G = (V, E)
    V = Users union Books
    E = { (user, book) | user has borrowed book }
    """
    G = nx.Graph()
    transactions = db.query(Transaction).all()
    for t in transactions:
        u = f"user_{t.user_id}"
        b = f"book_{t.book_id}"
        G.add_node(u, node_type="user")
        G.add_node(b, node_type="book")
        G.add_edge(u, b)
    logger.info(f"Graph built: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges")
    return G

def get_recommendations_bfs(
    user_id: int,
    db: Session,
    max_recommendations: int = 5
) -> List[Dict]:
    """
    BFS Collaborative Filtering — 2 hop traversal:
    Hop 1: books this user borrowed
    Hop 2: other users who borrowed same books
    Hop 3: books those users borrowed that target user hasnt read
    Score = how many similar users borrowed that book
    """
    G           = build_user_book_graph(db)
    target_node = f"user_{user_id}"

    if target_node not in G:
        return []

    user_books = {
        n for n in G.neighbors(target_node)
        if G.nodes[n].get("node_type") == "book"
    }
    if not user_books:
        return []

    candidate_scores = defaultdict(int)
    for book_node in user_books:
        similar_users = [
            n for n in G.neighbors(book_node)
            if n != target_node and G.nodes[n].get("node_type") == "user"
        ]
        for sim_user in similar_users:
            their_books = {
                n for n in G.neighbors(sim_user)
                if G.nodes[n].get("node_type") == "book"
            }
            for new_book in their_books - user_books:
                candidate_scores[new_book] += 1

    ranked = sorted(candidate_scores.items(), key=lambda x: x[1], reverse=True)

    recommendations = []
    for book_node, score in ranked[:max_recommendations]:
        bid  = int(book_node.replace("book_", ""))
        book = db.query(Book).filter(Book.book_id == bid).first()
        if book:
            recommendations.append({
                "book_id":               book.book_id,
                "title":                 book.title,
                "author":                book.author,
                "category":              book.category,
                "available_licenses":    book.available_licenses,
                "recommendation_score":  score,
                "reason": f"Borrowed by {score} user(s) with similar reading history"
            })
    return recommendations