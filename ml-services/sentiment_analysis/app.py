from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline

app=FastAPI()

#load sentiment pipeline(pretrained)
sentiment_model=pipeline("sentiment-analysis")

#Request Body Schema
class ReviewRequest(BaseModel):
  text:str

#Response Schema
class SentimentResponse(BaseModel):
  sentiment: str
  confidence: float

@app.get("/")
def home():
    return {"message: Sentiment API running"}

@app.post("/predict-sentiment", response_model=SentimentResponse)
def predict_sentiment(request: ReviewRequest):
   result=sentiment_model(request.text)[0]

   label=result["label"] # POSITIVE / NEGATIVE

   score=float(result["score"])

   # Convert into your categories
   if label == "POSITIVE":
        sentiment = "positive"
   else:
        sentiment = "negative"

   return {
        "sentiment": sentiment,
        "confidence": score
    }


