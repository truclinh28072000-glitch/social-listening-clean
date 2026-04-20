import feedparser
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sqlite3

app = FastAPI()

# =========================
# CORS
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# DATABASE
# =========================
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


# =========================
# GET POSTS
# =========================
@app.get("/posts")
def get_posts():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    cur.execute("SELECT * FROM posts ORDER BY id DESC")
    rows = cur.fetchall()

    conn.close()
    return [dict(row) for row in rows]


# =========================
# RESET DATABASE
# =========================
@app.get("/reset")
def reset_data():
    conn = sqlite3.connect(DB)
    cur = conn.cursor()

    cur.execute("DELETE FROM posts")
    cur.execute("DELETE FROM sqlite_sequence WHERE name='posts'")

    conn.commit()
    conn.close()

    return {"message": "Database reset success"}


# =========================
# SEED DATA (ION LIFE ONLY)
# =========================
@app.get("/seed")
def seed_data():
    conn = sqlite3.connect(DB)
    cur = conn.cursor()

    sample = [
        ("Facebook", "Ion Life", "Ion Life giúp cấp nước tốt mỗi ngày", "Positive", 120),
        ("TikTok", "Ion Life", "Review Ion Life sau khi tập gym", "Positive", 95),
        ("YouTube", "Ion Life", "Ion Life có thật sự tốt cho sức khỏe?", "Positive", 88),
        ("Facebook", "Ion Life", "Ion Life hơi khó mua ở cửa hàng gần nhà", "Negative", 45),
        ("TikTok", "Ion Life", "Detox cùng Ion Life và healthy lifestyle", "Positive", 130),
        ("YouTube", "Ion Life", "So sánh Ion Life với nước thường", "Positive", 76),
    ]

    cur.executemany("""
        INSERT INTO posts
        (platform, brand, content, sentiment, likes)
        VALUES (?, ?, ?, ?, ?)
    """, sample)

    conn.commit()
    conn.close()

    return {"message": "Seed success"}


# =========================
# FAKE NEWS
# =========================
@app.get("/crawl")
def crawl_news():
    conn = sqlite3.connect(DB)
    cur = conn.cursor()

    sample = [
        ("News", "Ion Life", "Ion Life xuất hiện trên báo điện tử", "Positive", 0),
        ("News", "Ion Life", "Người dùng đánh giá tốt sản phẩm", "Positive", 0),
        ("News", "Ion Life", "Một số phản hồi cần cải thiện", "Negative", 0)
    ]

    cur.executemany("""
        INSERT INTO posts
        (platform, brand, content, sentiment, likes)
        VALUES (?, ?, ?, ?, ?)
    """, sample)

    conn.commit()
    conn.close()

    return {"message": "Fake crawl success"}


# =========================
# REAL NEWS CRAWL
# =========================
@app.get("/crawl-real")
def crawl_real():
    conn = sqlite3.connect(DB)
    cur = conn.cursor()

    keyword_groups = [
        "Ion Life OR I-on Life OR nước ion kiềm",
        "detox OR đẹp da OR cấp nước",
        "healthy lifestyle OR wellness",
        "alkaline water OR functional water",
        "nước đắt OR khó mua OR chai lỗi OR nước giả"
    ]

    inserted = 0

    for group in keyword_groups:
        try:
            query = group.replace(" ", "+")
            url = f"https://news.google.com/rss/search?q={query}&hl=vi&gl=VN&ceid=VN:vi"

            feed = feedparser.parse(url)

            for item in feed.entries[:3]:
                title = item.title
                sentiment = "Positive"

                bad_words = ["lỗi", "giả", "đắt", "khó", "kém"]

                if any(word in title.lower() for word in bad_words):
                    sentiment = "Negative"

                cur.execute("""
                    INSERT INTO posts
                    (platform, brand, content, sentiment, likes)
                    VALUES (?, ?, ?, ?, ?)
                """, (
                    "News",
                    "Ion Life",
                    title,
                    sentiment,
                    0
                ))

                inserted += 1

        except:
            continue

    conn.commit()
    conn.close()

    return {"message": f"Crawled {inserted} real posts"}