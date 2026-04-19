from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Cho phép frontend truy cập
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Social Listening API Running"}

@app.get("/posts")
def get_posts():
    return [
        {
            "platform": "Facebook",
            "brand": "Ion Life",
            "content": "Ion Life dùng rất tốt",
            "sentiment": "Positive",
            "likes": 120
        },
        {
            "platform": "TikTok",
            "brand": "Ion Life",
            "content": "Không thấy hiệu quả lắm",
            "sentiment": "Negative",
            "likes": 25
        },
        {
            "platform": "YouTube",
            "brand": "Ion Life",
            "content": "Review chi tiết và dễ hiểu",
            "sentiment": "Positive",
            "likes": 80
        }
    ]