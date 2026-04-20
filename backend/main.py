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
        },
        {
            "id": 4,
            "platform": "YouTube",
            "brand": "Ion Life",
            "content": "Review nước ion kiềm chi tiết",
            "sentiment": "Positive",
            "likes": 210
        }
    ]