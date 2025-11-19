from api.models.TransactionRecord import TransactionRecord
import pickle

model : any

with open('../ai_model/et_model.pkl') as f:
    model = pickle.load(f)
    
def is_fraud(tx: TransactionRecord) -> bool:

    return False