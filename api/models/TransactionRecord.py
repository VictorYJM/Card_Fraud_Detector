from datetime import datetime
from pydantic import BaseModel

class TransactionRecord(BaseModel):
    card_id: int
    card_bin: int
    card_first_transaction : datetime
    terminal_id: int
    latitude : float
    longitude : float
    terminal_operation_start: datetime
    tx_amount: float
    tx_datetime: datetime