from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017")
db = client["sentiment_db"]

reviews_collection = db["reviews"]