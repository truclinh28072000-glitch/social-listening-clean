from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import requests
import feedparser
from bs4 import BeautifulSoup

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB = "social.db"


# ---------------- DB INIT ----------------
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


# ---------------- GET POSTS ----------------
@app.get("/posts")
def get_posts():
    conn = sqlite3.connect(DB)
    cur = conn.cursor()

    cur.execute("SELECT * FROM posts ORDER BY id DESC")
    rows = cur.fetchall()

    conn.close()

    return [
        {
            "id": r[0],
            "platform": r[1],
            "brand": r[2],
            "content": r[3],
            "sentiment": r[4],
            "likes": r[5]
        }
        for r in rows
    ]


# ---------------- RESET ----------------
@app.get("/reset")
def reset():
    conn = sqlite3.connect(DB)
    cur = conn.cursor()
    cur.execute("DELETE FROM posts")
    conn.commit()
    conn.close()
    return {"message": "Reset success"}


# ---------------- TIKTOK MOCK ----------------
@app.get("/crawl-tiktok")
def crawl_tiktok():
    conn = sqlite3.connect(DB)
    cur = conn.cursor()

    data = [
        ("TikTok", "Ion Life", "Review nước ion kiềm tốt cho gym", "Positive", 420),
        ("TikTok", "Ion Life", "Ion Life uống khá ổn, vị dễ uống", "Positive", 310),
        ("TikTok", "Ion Life", "Giá hơi cao so với nước thường", "Negative", 150),
    ]

    for row in data:
        cur.execute("""
        INSERT INTO posts (platform, brand, content, sentiment, likes)
        VALUES (?, ?, ?, ?, ?)
        """, row)

    conn.commit()
    conn.close()

    return {"message": "TikTok mock added"}


# ---------------- NEWS REAL ----------------
@app.get("/crawl-news")
def crawl_news():
    conn = sqlite3.connect(DB)
    cur = conn.cursor()

    keyword = "Ion Life"
    url = f"https://news.google.com/rss/search?q={keyword}"

    feed = feedparser.parse(url)

    count = 0

    for item in feed.entries[:5]:
        title = item.title

        sentiment = "Positive"
        bad_words = ["lỗi", "giả", "đắt", "kém"]

        if any(w in title.lower() for w in bad_words):
            sentiment = "Negative"

        cur.execute("""
        INSERT INTO posts (platform, brand, content, sentiment, likes)
        VALUES (?, ?, ?, ?, ?)
        """, ("News", "Ion Life", title, sentiment, 0))

        count += 1

    conn.commit()
    conn.close()

    return {"message": f"Added {count} news posts"}


# ---------------- SHOPEE MOCK REALISTIC ----------------
@app.get("/crawl-shopee")
def crawl_shopee():
    conn = sqlite3.connect(DB)
    cur = conn.cursor()

    data = [
        ("Shopee", "Ion Life", "5 sao - giao nhanh, uống ngon", "Positive", 88),
        ("Shopee", "Ion Life", "Giá cao nhưng chất lượng tốt", "Positive", 65),
        ("Shopee", "Ion Life", "Chai hơi móp khi nhận hàng", "Negative", 20),
    ]

    for row in data:
        cur.execute("""
        INSERT INTO posts (platform, brand, content, sentiment, likes)
        VALUES (?, ?, ?, ?, ?)
        """, row)

    conn.commit()
    conn.close()

    return {"message": "Shopee reviews added"}


# ---------------- ALL DATA ----------------
@app.get("/all-data")
def all_data():
    crawl_news()
    crawl_tiktok()
    crawl_shopee()
    return {"message": "All data loaded"}