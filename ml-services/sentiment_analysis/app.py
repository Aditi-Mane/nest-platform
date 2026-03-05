from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline

app = FastAPI()

sentiment_model = pipeline("sentiment-analysis")

class ReviewRequest(BaseModel):
    text: str

@app.post("/predict-sentiment")
def predict_sentiment(request: ReviewRequest):

    result = sentiment_model(request.text)[0]

    label = result["label"]
    score = float(result["score"])

    if label == "POSITIVE":
        sentiment = "positive"
    else:
        sentiment = "negative"

    return {
        "sentiment": sentiment,
        "confidence": score
    }

