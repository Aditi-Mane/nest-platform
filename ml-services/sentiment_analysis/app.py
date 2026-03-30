from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline
from fastapi.middleware.cors import CORSMiddleware
from db import reviews_collection

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

