from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
from collections import Counter
import math

app = FastAPI()

class RecommendationRequest(BaseModel):
    query: str
    products: list  # [{id, text}]

def tokenize(text):
    return text.lower().split()

def compute_tf(text_tokens):
    tf = Counter(text_tokens)
    total = len(text_tokens)
    return {word: count / total for word, count in tf.items()}

def compute_idf(docs):
    N = len(docs)
    idf = {}
    all_words = set(word for doc in docs for word in doc)
    
    for word in all_words:
        containing = sum(1 for doc in docs if word in doc)
        idf[word] = math.log(N / (1 + containing))
    
    return idf

def compute_tfidf(tf, idf):
    return {word: tf[word] * idf.get(word, 0) for word in tf}

def cosine_sim(vec1, vec2):
    common = set(vec1.keys()) & set(vec2.keys())
    
    dot = sum(vec1[w] * vec2[w] for w in common)
    norm1 = math.sqrt(sum(v*v for v in vec1.values()))
    norm2 = math.sqrt(sum(v*v for v in vec2.values()))
    
    if norm1 == 0 or norm2 == 0:
        return 0.0
    
    return dot / (norm1 * norm2)

@app.post("/recommend")
def recommend(req: RecommendationRequest):
    try:
        product_texts = [p["text"] for p in req.products]
        product_ids = [p["id"] for p in req.products]

        docs_tokens = [tokenize(req.query)] + [tokenize(t) for t in product_texts]

        idf = compute_idf(docs_tokens)

        tfidf_vectors = []
        for tokens in docs_tokens:
            tf = compute_tf(tokens)
            tfidf_vectors.append(compute_tfidf(tf, idf))

        query_vec = tfidf_vectors[0]
        product_vecs = tfidf_vectors[1:]

        results = []
        for i, vec in enumerate(product_vecs):
            score = cosine_sim(query_vec, vec)
            results.append({
                "id": product_ids[i],
                "score": float(score)
            })

        results = sorted(results, key=lambda x: x["score"], reverse=True)

        return {"results": results[:5]}

    except Exception as e:
        return {"error": str(e)}