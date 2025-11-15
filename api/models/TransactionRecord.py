from pydantic import BaseModel

class TransactionRecord(BaseModel):
    card_id: int
    card_bin: int
    terminal_id: int
    tx_amount: float
    tx_datetime: str
