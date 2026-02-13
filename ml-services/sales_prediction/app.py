from fastapi import FastAPI
import joblib
import numpy as np
from db import orders_collection

app = FastAPI()

# Load trained model
model = joblib.load("sales_model.pkl")


@app.get("/")
def root():
    return {"message": "Sales Prediction Service Running"}


@app.get("/predict-sales/{sellerId}")
def predict_sales(sellerId: str):
    """
    Predict next month's sales for a seller
    """

    # Fetch seller orders from MongoDB
    orders = list(
        orders_collection.find({"sellerId": sellerId})
    )

    if len(orders) == 0:
        return {"error": "No sales data found for this seller"}

    # Example: total earnings
    total_sales = sum(order["amount"] for order in orders)

    # Feature input (simple demo)
    X = np.array([[total_sales]])

    # Predict
    prediction = model.predict(X)[0]

    return {
        "sellerId": sellerId,
        "predicted_next_month_sales": float(prediction)
    }
