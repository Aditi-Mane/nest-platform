import pandas as pd
from sklearn.linear_model import LinearRegression
import joblib

# Dummy sales history (replace later with MongoDB)
data = {
    "month": [1, 2, 3, 4, 5],
    "sales": [200, 250, 300, 280, 350]
}

df = pd.DataFrame(data)

X = df[["month"]]
y = df["sales"]

model = LinearRegression()
model.fit(X, y)

joblib.dump(model, "sales_model.pkl")

print("✅ Sales Model Trained & Saved")
