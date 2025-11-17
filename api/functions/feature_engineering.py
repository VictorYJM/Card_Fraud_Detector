from models import TransactionRecord, TransactionProcessed
from datetime import datetime

def feature_engineering(tx: TransactionRecord) -> TransactionProcessed:
    dt = datetime.fromisoformat(tx.tx_datetime)

    tx_hour = dt.hour
    is_weekend = int(dt.weekday > 5)