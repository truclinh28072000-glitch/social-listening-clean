# ===============================
# FULL FIX BACKEND main.py
# Fix:
# 1. {"detail":"Not Found"}
# 2. posts.filter is not a function
# ===============================

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

@app.get("/")
def home():
    return {"message": "API running"}

@app.get("/posts")
def get_posts():
    return [
        {
            "id": 1,
            "platform": "TikTok",
            "brand": "Ion Life",
            "content": "Review nước ion kiềm tốt cho gym",
            "sentiment": "Positive",
            "likes": 420
        },
        {
            "id": 2,
            "platform": "Shopee",
            "brand": "Ion Life",
            "content": "5 sao - giao nhanh, uống ngon",
            "sentiment": "Positive",
            "likes": 88
        },
        {
            "id": 3,
            "platform": "Facebook",
            "brand": "Ion Life",
            "content": "Giá hơi cao nhưng chất lượng tốt",
            "sentiment": "Neutral",
            "likes": 65
        }
    ]

# ===============================
# INIT DATABASE
# ===============================
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

# ===============================
# HOME
# ===============================
@app.get("/")
def home():
    return {"message": "API Running"}

# ===============================
# RESET DATA
# ===============================
@app.get("/reset")
def reset():
    conn = sqlite3.connect(DB)
    cur = conn.cursor()

    cur.execute("DELETE FROM posts")

    conn.commit()
    conn.close()

    return {"message": "All data deleted"}

# ===============================
# SEED SAMPLE DATA
# ===============================
@app.get("/seed")
def seed():
    sample = [
        ("TikTok", "Ion Life", "Review nước ion kiềm tốt cho gym", "Positive", 420),
        ("TikTok", "Ion Life", "Ion Life uống khá ổn dễ uống", "Positive", 310),
        ("TikTok", "Ion Life", "Giá hơi cao so với nước thường", "Negative", 150),

        ("Shopee", "Ion Life", "5 sao giao nhanh uống ngon", "Positive", 88),
        ("Shopee", "Ion Life", "Giá cao nhưng chất lượng tốt", "Positive", 65),
        ("Shopee", "Ion Life", "Chai hơi móp khi nhận hàng", "Negative", 20),

        ("News", "Ion Life", "Ion Life xuất hiện trên báo điện tử", "Positive", 0),
        ("News", "Ion Life", "Người dùng đánh giá tốt sản phẩm", "Positive", 0),
        ("News", "Ion Life", "Một số phản hồi cần cải thiện", "Negative", 0),
    ]

    conn = sqlite3.connect(DB)
    cur = conn.cursor()

    for row in sample:
        cur.execute("""
        INSERT INTO posts(platform, brand, content, sentiment, likes)
        VALUES (?, ?, ?, ?, ?)
        """, row)

    conn.commit()
    conn.close()

    return {"message": "Seed success"}

# ===============================
# IMPORTANT FIX: /posts
# This solves:
# {"detail":"Not Found"}
# posts.filter is not a function
# ===============================
@app.get("/posts")
def get_posts():
    conn = sqlite3.connect(DB)
    cur = conn.cursor()

    cur.execute("""
        SELECT id, platform, brand, content, sentiment, likes
        FROM posts
        ORDER BY id DESC
    """)

    rows = cur.fetchall()
    conn.close()

    result = []

    for r in rows:
        result.append({
            "id": r[0],
            "platform": r[1],
            "brand": r[2],
            "content": r[3],
            "sentiment": r[4],
            "likes": r[5]
        })

    return result

# ===============================
# OPTIONAL: ALL DATA LOAD
# ===============================
@app.get("/all-data")
def all_data():
    return {"message": "Use /posts endpoint"}