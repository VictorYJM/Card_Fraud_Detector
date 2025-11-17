from pydantic import BaseModel
from models import TransactionRecord
from datetime import datetime

class TransactionProcessed(BaseModel):
    terminal_fraud_rate : float
    card_fraud_rate : float
    bin_fraud_rate : float
    distance_from_last_location_km : float
    number_of_transactions : int
    velocity_risk_level : float
    tx_datetime : datetime
    card_lifetime_days : int
    card_num_terminals : int
    is_night : int
    card_night_rate : float
    is_micro_transaction : int
    amount_zscore : float
    time_since_last_tx_minutes : float
    time_since_last_tx_zscore : float
    tx_hour : int
    is_weekend: int
    is_first_time_terminal : int
    terminal_lifetime_days : int