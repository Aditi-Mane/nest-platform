from fastapi import FastAPI
from pydantic import BaseModel
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI()

class RecommendationRequest(BaseModel):
    query: str
    products: list  # [{id, text}]

@app.post("/recommend")
def recommend(req: RecommendationRequest):
    try:
        product_texts = [p["text"] for p in req.products]
        product_ids = [p["id"] for p in req.products]

        # Combine query + product texts
        corpus = [req.query] + product_texts

        vectorizer = TfidfVectorizer()
        vectors = vectorizer.fit_transform(corpus)

        query_vector = vectors[0]
        product_vectors = vectors[1:]

        scores = cosine_similarity(query_vector, product_vectors)[0]

        results = []
        for i, score in enumerate(scores):
            results.append({
                "id": product_ids[i],
                "score": float(score)
            })

        # sort by similarity
        results = sorted(results, key=lambda x: x["score"], reverse=True)

        return {"results": results[:5]}

    except Exception as e:
        return {"error": str(e)}