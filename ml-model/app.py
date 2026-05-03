import sys
import os

print("=" * 60)
print("🚀 Starting HealthMateAI ML Server...")
print("=" * 60)






BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")

print(f"📂 Base Dir: {BASE_DIR}")
print(f"📂 Models Dir: {MODELS_DIR}")






try:
    from flask import Flask, request, jsonify
    from flask_cors import CORS
    import joblib
    import numpy as np
    from utils.preprocessing import (
        prepare_symptom_vector,
        calculate_confidence,
        normalize_symptom
    )
    print("✅ All imports successful")
except Exception as e:
    print(f"❌ Import error: {e}")
    sys.exit(1)

app = Flask(__name__)
CORS(app)





MODEL_LOADED = False

try:
    disease_model = joblib.load(os.path.join(MODELS_DIR, "disease_model.pkl"))
    label_encoder = joblib.load(os.path.join(MODELS_DIR, "label_encoder.pkl"))
    symptom_columns = joblib.load(os.path.join(MODELS_DIR, "symptom_columns.pkl"))
    risk_model = joblib.load(os.path.join(MODELS_DIR, "risk_model.pkl"))

    MODEL_LOADED = True
    print("✅ Models loaded successfully")

except Exception as e:
    print(f"❌ Model loading failed: {e}")
    MODEL_LOADED = False  # DO NOT crash server





@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "modelLoaded": MODEL_LOADED
    })






@app.route("/predict", methods=["POST"])
def predict():
    try:
        if not MODEL_LOADED:
            return jsonify({
                "error": "Model not available",
                "predictedDisease": "Unavailable",
                "confidence": 0,
                "mlEnhanced": False
            }), 503

        data = request.get_json()

        if not data or "symptoms" not in data:
            return jsonify({"error": "No symptoms provided"}), 400

        raw_symptoms = data.get("symptoms", [])

        # ✅ CLEAN INPUT
        symptoms = [
            normalize_symptom(str(s))
            for s in raw_symptoms
            if isinstance(s, (str, int, float)) and str(s).strip()
        ]

        if not symptoms:
            return jsonify({"error": "No valid symptoms"}), 400

        print(f"📊 Symptoms: {symptoms}")

       
        vector = prepare_symptom_vector(symptoms, symptom_columns)
        vector = vector.reshape(1, -1)

        probs = disease_model.predict_proba(vector)[0]
        pred_idx = disease_model.predict(vector)[0]

        disease = label_encoder.inverse_transform([pred_idx])[0]
        confidence = calculate_confidence(probs)

        # Top 3 predictions
        top_idx = np.argsort(probs)[-3:][::-1]
        top_preds = [
            {
                "disease": label_encoder.inverse_transform([i])[0],
                "probability": float(probs[i] * 100)
            }
            for i in top_idx
        ]

        print(f"✅ Prediction: {disease} ({confidence}%)")

        return jsonify({
            "predictedDisease": disease,
            "confidence": confidence,
            "topPredictions": top_preds,
            "mlEnhanced": True,
            "mortalityRisk": {
                "risk": "Medium",
                "probability": 50,
                "baseSeverity": "Medium"
            }
        })

    except Exception as e:
        print(f"❌ Prediction error: {e}")

        return jsonify({
            "error": "Prediction failed",
            "predictedDisease": "General Illness",
            "confidence": 40,
            "mlEnhanced": False
        }), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    print(f"\n🌐 Running on port {port}")
    app.run(host="0.0.0.0", port=port)
