from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from db import reviews_collection
from collections import Counter, defaultdict
from datetime import datetime

app = FastAPI()

# Allow React to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple keyword-based sentiment
positive_words = ["good", "great", "excellent", "amazing", "love", "nice", "best"]
negative_words = ["bad", "worst", "terrible", "awful", "hate", "poor"]

class ReviewRequest(BaseModel):
    text: str

# ---------------- SENTIMENT API ----------------
@app.post("/predict-sentiment")
def predict_sentiment(request: ReviewRequest):
    text = request.text.lower()

    pos_score = sum(word in text for word in positive_words)
    neg_score = sum(word in text for word in negative_words)

    if pos_score > neg_score:
        sentiment = "positive"
        confidence = pos_score / (pos_score + neg_score + 1)
    elif neg_score > pos_score:
        sentiment = "negative"
        confidence = neg_score / (pos_score + neg_score + 1)
    else:
        sentiment = "neutral"
        confidence = 0.5

    return {
        "sentiment": sentiment,
        "confidence": float(confidence)
    }

# ---------------- GET REVIEWS ----------------
@app.get("/reviews")
def get_reviews():
    return list(reviews_collection.find({}, {"_id": 0}))

# ---------------- ANALYTICS ----------------
@app.get("/analytics")
def get_analytics():
    reviews = list(reviews_collection.find({}, {"_id": 0}))
    total = len(reviews)

    sentiments = [r.get("sentiment") for r in reviews if r.get("sentiment")]
    sentiment_count = Counter(sentiments)

    positive = sentiment_count.get("positive", 0)
    neutral = sentiment_count.get("neutral", 0)
    negative = sentiment_count.get("negative", 0)

    positive_rate = (positive / total) * 100 if total else 0
    score = ((positive * 1) + (neutral * 0.5)) / total * 10 if total else 0

    trend = defaultdict(list)

    for r in reviews:
        date = r.get("createdAt")

        if not date:
            continue

        if isinstance(date, str):
            try:
                date = datetime.fromisoformat(date.replace("Z", "+00:00"))
            except:
                continue

        week = date.strftime("%Y-W%U")
        trend[week].append(r)

    def week_key(week_str):
        year, week = week_str.split("-W")
        return int(year), int(week)

    trend_data = []

    for week, items in sorted(trend.items(), key=lambda x: week_key(x[0])):
        pos = sum(1 for i in items if i.get("sentiment") == "positive")
        trend_score = (pos / len(items)) * 10

        trend_data.append({
            "name": week,
            "value": round(trend_score, 2)
        })

    return {
        "totalReviews": total,
        "positiveRate": round(positive_rate, 2),
        "overallScore": round(score, 2),
        "sentimentDistribution": {
            "positive": positive,
            "neutral": neutral,
            "negative": negative
        },
        "trend": trend_data
    }