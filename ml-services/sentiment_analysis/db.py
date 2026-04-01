from pymongo import MongoClient

client = MongoClient("mongodb+srv://aditimane549_db_user:O076GWNIpvfoSuni@nestdb.m9wm8kv.mongodb.net/?appName=nestDB")

db = client["test"]   
reviews_collection = db["reviews"]