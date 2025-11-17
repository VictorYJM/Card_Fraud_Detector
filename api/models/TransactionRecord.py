from pydantic import BaseModel
from datetime import datetime
class TransactionRecord(BaseModel):
    card_id: int
    card_bin: int
    terminal_id: int
    tx_amount: float
    tx_datetime: datetime
    latitude : float
    longitude : float
    card_first_transaction : datetime
