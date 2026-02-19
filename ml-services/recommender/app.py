from pymongo import MongoClient
from bson import ObjectId

from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

client = MongoClient(process.env.M)  
db = client["nestdb"]
products_collection = db["products"]

app = FastAPI()


# ---------- Request Schema ----------
class ProductInput(BaseModel):
    id: str
    text: str


class RecommendationRequest(BaseModel):
    current_product_id: str
    products: List[ProductInput]


# ---------- API Endpoint ----------
@app.post("/recommend/content-based")
def recommend_products(req: RecommendationRequest):

    # Extract all texts
    product_texts = [p.text for p in req.products]
    product_ids = [p.id for p in req.products]

    # TF-IDF Vectorization
    vectorizer = TfidfVectorizer(stop_words="english")
    tfidf_matrix = vectorizer.fit_transform(product_texts)

    # Find index of current product
    if req.current_product_id not in product_ids:
        return {"error": "Product not found in dataset"}

    current_index = product_ids.index(req.current_product_id)

    # Cosine similarity
    similarity_scores = cosine_similarity(
        tfidf_matrix[current_index],
        tfidf_matrix
    ).flatten()

    # Sort by similarity score
    similar_products = sorted(
        zip(product_ids, similarity_scores),
        key=lambda x: x[1],
        reverse=True
    )

    # Remove itself + take top 5
    top_recommendations = [
        {"productId": pid, "score": float(score)}
        for pid, score in similar_products
        if pid != req.current_product_id
    ][:5]

    return {"recommendations": top_recommendations}
