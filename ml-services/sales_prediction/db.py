from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")

client = MongoClient(MONGO_URL)
db = client["nest_platform"]

#if "orders" collection exists
orders_collection = db["orders"]


#Sample data used by this api
{
  "sellerId": "123",
  "amount": 200,
  "createdAt": "2026-02-01"
}
{
  "sellerId": "123",
  "amount": 350,
  "createdAt": "2026-02-05"
}
{
  "sellerId": "123",
  "amount": 500,
  "createdAt": "2026-02-10"
}