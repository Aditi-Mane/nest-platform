from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline
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

# Load sentiment model
sentiment_model = pipeline(
    "sentiment-analysis",
    model="cardiffnlp/twitter-roberta-base-sentiment"
)

class ReviewRequest(BaseModel):
    text: str

# ---------------- SENTIMENT API ----------------
@app.post("/predict-sentiment")
def predict_sentiment(request: ReviewRequest):
    result = sentiment_model(request.text)[0]

    label = result["label"]
    score = float(result["score"])

    if label == "LABEL_2":
        sentiment = "positive"
    elif label == "LABEL_1":
        sentiment = "neutral"
    else:
        sentiment = "negative"

    return {
        "sentiment": sentiment,
        "confidence": score
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

    # Percentages
    positive_rate = (positive / total) * 100 if total else 0

    # Overall score
    score = ((positive * 1) + (neutral * 0.5)) / total * 10 if total else 0

    # -------- WEEKLY TREND --------
    trend = defaultdict(list)

    for r in reviews:
        date = r.get("createdAt")

        if not date:
            continue

        # Handle string date
        if isinstance(date, str):
            try:
                date = datetime.fromisoformat(date.replace("Z", "+00:00"))
            except:
                continue

        # Group by week
        week = date.strftime("%Y-W%U")
        trend[week].append(r)

    # Proper sorting function
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

    # OPTIONAL: limit to last 10 weeks (adjust if needed)
    # trend_data = trend_data[-10:]

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