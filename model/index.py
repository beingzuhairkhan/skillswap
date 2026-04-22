import os
from fastapi import FastAPI
import pickle

app = FastAPI()

# IMPORTANT for Render (dynamic port)
PORT = int(os.environ.get("PORT", 8000))

model = pickle.load(open("model.pkl", "rb"))

@app.get("/")
def home():
    return {"message": "ML API running 🚀"}

@app.post("/predict")
def predict(data: dict):
    hard_ratio = data["hard_solved"] / (data["leetcode_solved"] + 1)
    repo_score = data["repos"] * 0.7 + data["followers"] * 0.3

    user = [[
        data["leetcode_solved"],
        data["easy_solved"],
        data["medium_solved"],
        data["hard_solved"],
        data["repos"],
        data["followers"],
        hard_ratio,
        repo_score
    ]]

    prediction = model.predict(user)[0]
    confidence = max(model.predict_proba(user)[0])

    return {
        "badge": prediction,
        "confidence": float(confidence)
    }