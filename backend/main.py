import sqlite3
import feedparser
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB = "social.db"


def init_db():
    conn = sqlite3.connect(DB)
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        platform TEXT,
        brand TEXT,
        content TEXT,
        sentiment TEXT,
        likes INTEGER
    )
    """)

    conn.commit()
    conn.close()


init_db()


@app.get("/")
def home():
    return {"message": "API Running"}


@app.get("/posts")
def get_posts():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    cur.execute("SELECT * FROM posts ORDER BY id DESC")
    rows = cur.fetchall()

    conn.close()
    return [dict(row) for row in rows]


@app.get("/seed")
def seed_data():
    conn = sqlite3.connect(DB)
    cur = conn.cursor()

    sample = [
        ("Facebook", "Ion Life", "Máy lọc nước tốt", "Positive", 120),
        ("TikTok", "Cocoon", "Review chưa ổn", "Negative", 55),
        ("YouTube", "La Roche", "Serum đáng mua", "Positive", 88),
    ]

    cur.executemany(
        """
        INSERT INTO posts (platform, brand, content, sentiment, likes)
        VALUES (?, ?, ?, ?, ?)
        """,
        sample
    )

    conn.commit()
    conn.close()

    return {"message": "Seed success"}


@app.get("/crawl")
def crawl_news():
    conn = sqlite3.connect(DB)
    cur = conn.cursor()

    sample = [
        ("News", "Ion Life", "Ion Life xuất hiện trên báo điện tử", "Positive", 0),
        ("News", "Ion Life", "Người dùng đánh giá tốt sản phẩm", "Positive", 0),
        ("News", "Ion Life", "Một số phản hồi cần cải thiện", "Negative", 0),
    ]

    cur.executemany(
        """
        INSERT INTO posts (platform, brand, content, sentiment, likes)
        VALUES (?, ?, ?, ?, ?)
        """,
        sample
    )

    conn.commit()
    conn.close()

    return {"message": "Fake crawl success"}