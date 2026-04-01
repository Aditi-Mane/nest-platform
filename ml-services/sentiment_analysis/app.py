# from fastapi import FastAPI
# from pydantic import BaseModel
# from transformers import pipeline
# from fastapi.middleware.cors import CORSMiddleware
# from db import reviews_collection
# from collections import Counter
# from datetime import datetime
# from collections import defaultdict


# app = FastAPI()

# # Allow React to connect
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Better model
# sentiment_model = pipeline(
#     "sentiment-analysis",
#     model="cardiffnlp/twitter-roberta-base-sentiment"
# )

# class ReviewRequest(BaseModel):
#     text: str

# @app.post("/predict-sentiment")
# def predict_sentiment(request: ReviewRequest):

#     result = sentiment_model(request.text)[0]

#     label = result["label"]
#     score = float(result["score"])

#     if label == "LABEL_2":
#         sentiment = "positive"
#     elif label == "LABEL_1":
#         sentiment = "neutral"
#     else:
#         sentiment = "negative"

#     return {
#         "sentiment": sentiment,
#         "confidence": score
#     }
    
# @app.get("/reviews")
# def get_reviews():
#     reviews = list(reviews_collection.find({}, {"_id": 0}))
#     return reviews

# @app.get("/analytics")
# def get_analytics():
#     reviews = list(reviews_collection.find({}, {"_id": 0}))

#     total = len(reviews)

#     sentiments = [r.get("sentiment") for r in reviews if r.get("sentiment")]
#     sentiment_count = Counter(sentiments)

#     positive = sentiment_count.get("positive", 0)
#     neutral = sentiment_count.get("neutral", 0)
#     negative = sentiment_count.get("negative", 0)

#     # Percentages
#     positive_rate = (positive / total) * 100 if total else 0

#     # Overall score (simple logic)
#     score = ((positive * 1) + (neutral * 0.5)) / total * 10 if total else 0

#     # Trend (group by month)
#     # trend = {}
#     # for r in reviews:
#     #     date = r.get("createdAt")
#     #     if date:
#     #         month = date.strftime("%b")
#     #         trend.setdefault(month, []).append(r)

#     # trend_data = []
#     # for month, items in trend.items():
#     #     pos = sum(1 for i in items if i["sentiment"] == "positive")
#     #     trend_score = (pos / len(items)) * 10
#     #     trend_data.append({"name": month, "value": round(trend_score, 2)})
    
    

#     # Keywords (simple word frequency)
#     # word_counter = Counter()
#     # for r in reviews:
#     #     words = r["text"].lower().split()
#     #     word_counter.update(words)

#     # keywords = [{"text": k, "count": v} for k, v in word_counter.most_common(10)]

#     return {
#         "totalReviews": total,
#         "positiveRate": round(positive_rate, 2),
#         "overallScore": round(score, 2),
#         "sentimentDistribution": {
#             "positive": positive,
#             "neutral": neutral,
#             "negative": negative
#         },
#         "trend": trend_data,
#         # "keywords": keywords
#     }

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

# Better model
sentiment_model = pipeline(
    "sentiment-analysis",
    model="cardiffnlp/twitter-roberta-base-sentiment"
)

class ReviewRequest(BaseModel):
    text: str

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


@app.get("/reviews")
def get_reviews():
    reviews = list(reviews_collection.find({}, {"_id": 0}))
    return reviews


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

    # Overall score (simple logic)
    score = ((positive * 1) + (neutral * 0.5)) / total * 10 if total else 0

    # ✅ DAY-WISE TREND (NEW - without changing your logic)
    trend = defaultdict(list)

    for r in reviews:
        date = r.get("createdAt")

        if date:
            # Handle both string and datetime
            if isinstance(date, str):
                try:
                    date = datetime.fromisoformat(date.replace("Z", "+00:00"))
                except:
                    continue

            day = date.strftime("%Y-%m-%d")   # 👈 DAY LEVEL
            trend[day].append(r)

    trend_data = []

    for day, items in sorted(trend.items()):
        pos = sum(1 for i in items if i.get("sentiment") == "positive")
        trend_score = (pos / len(items)) * 10

        trend_data.append({
            "name": day,
            "value": round(trend_score, 2)
        })

    # Optional: last 7 days only
    trend_data = trend_data[-7:]

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