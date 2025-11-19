from api.models.TransactionRecord import TransactionRecord
import joblib
import os
import sklearn

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "..", "ai_model", "et_model.pkl")

model = joblib.load(MODEL_PATH)
    
def is_fraud(tx: TransactionRecord) -> bool:
    pass