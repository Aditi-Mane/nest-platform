# We use Sentence Transformers to convert product descriptions into 
# embeddings and compute cosine similarity to recommend semantically similar items.

from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer, util

app = FastAPI()

model = SentenceTransformer('all-MiniLM-L6-v2')

class RecommendationRequest(BaseModel):
    query: str
    products: list  # [{id, text}]

@app.post("/recommend")
def recommend(req: RecommendationRequest):
    try:
        query_embedding = model.encode(req.query, convert_to_tensor=True)

        product_texts = [p["text"] for p in req.products]
        product_ids = [p["id"] for p in req.products]

        product_embeddings = model.encode(product_texts, convert_to_tensor=True)

        scores = util.cos_sim(query_embedding, product_embeddings)[0]

        results = []
        for i, score in enumerate(scores):
            results.append({
                "id": product_ids[i],
                "score": float(score)
            })

        # sort by similarity
        results = sorted(results, key=lambda x: x["score"], reverse=True)

        return {"results": results[:5]}  # top 5

    except Exception as e:
        return {"error": str(e)}