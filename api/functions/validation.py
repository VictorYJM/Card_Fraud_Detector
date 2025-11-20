import pandas as pd
from typing import Any
from joblib import load

model: Any = load('ai_model/et_model.pkl')

FEATURE_ORDER = [
    'amount_zscore',
    'time_since_last_tx_minutes',
    'card_lifetime_days',
    'terminal_lifetime_days',
    'tx_hour',
    'is_weekend',
    'is_night',
    'card_fraud_rate',
    # 'spending_velocity_ratio', # Ausente no seu notebook
    'time_since_last_tx_zscore',
    # 'tx_count_1h', # Ausente
    # 'tx_count_24h', # Ausente
    'number_of_transactions',
    'terminal_fraud_rate',
    'card_num_terminals',
    'card_night_rate',
    'is_first_time_terminal',
    'is_micro_transaction',
    # 'micro_tx_count_1h', # Ausente
    'bin_fraud_rate',
    # 'terminals_1h', # Ausente
    'distance_from_last_location_km',
    'velocity_risk_level'
]

def is_fraud(features: dict) -> bool:
    input_df = pd.DataFrame([features])
    input_df = input_df[FEATURE_ORDER]
    prediction = model.predict(input_df)
    return bool(prediction[0])