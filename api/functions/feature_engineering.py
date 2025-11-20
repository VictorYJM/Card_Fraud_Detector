import numpy as np
import pandas as pd
from pandas import DataFrame
from datetime import datetime
from models import TransactionProcessed, TransactionRecord

MICRO_TRANSACTION = 5

def haversine_distance(lat1, lon1, lat2, lon2):
    # Earth's radius (km)
    R = 6371.0

    # Convertion to radians
    lat1_rad = np.radians(lat1)
    lon1_rad = np.radians(lon1)
    lat2_rad = np.radians(lat2)
    lon2_rad = np.radians(lon2)

    dlon = lon2_rad - lon1_rad
    dlat = lat2_rad - lat1_rad

    # Haversine formula
    a = (
        np.sin(dlat / 2) ** 2
        + np.cos(lat1_rad) * np.cos(lat2_rad) * np.sin(dlon / 2) ** 2
    )
    c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1 - a))

    distance = R * c
    return distance

def feature_engineering(tx: TransactionRecord, last_transactions: DataFrame) -> dict:
    dt = tx.tx_datetime

    tx_hour = dt.hour
    is_weekend = int(dt.weekday() >= 5)
    is_night = 1 if (dt.hour >= 22 or dt.hour < 6) else 0

    card_lifetime_days = (tx.tx_datetime - tx.card_first_transaction).days
    terminal_lifetime_days = (tx.tx_datetime - tx.terminal_operation_start).days

    is_micro_transaction = 1 if (tx.tx_amount < MICRO_TRANSACTION) else 0

    last_tx_record = last_transactions[last_transactions['card_id'] == tx.card_id]

    if not last_tx_record.empty:
        last_tx_time = last_tx_record['tx_datetime'].iloc[0]
        last_latitude = last_tx_record['latitude'].iloc[0]
        last_longitude = last_tx_record['longitude'].iloc[0]

        time_diff = tx.tx_datetime - last_tx_time
        time_since_last_tx_minutes = time_diff.total_seconds() / 60

        distance_from_last_location_km = haversine_distance(tx.latitude, tx.longitude, last_latitude, last_longitude)
    else:
        time_since_last_tx_minutes = 0
        distance_from_last_location_km = 0.0

    time_in_hours = (time_since_last_tx_minutes / 60)
    velocity_kph = distance_from_last_location_km / (time_in_hours + 1e-6)

    velocity_risk_level = 0
    if velocity_kph > 900:
        velocity_risk_level = 2

    elif velocity_kph > 400:
        velocity_risk_level = 1

    amount_zscore = 0.0
    time_since_last_tx_zscore = 0.0
    
    card_fraud_rate = 0.0
    terminal_fraud_rate = 0.0
    bin_fraud_rate = 0.0
    
    number_of_transactions = 0
    card_num_terminals = 0.0
    card_night_rate = 0.0
    is_first_time_terminal = 1

    spending_velocity_ratio = 0.0
    tx_count_1h = 0
    tx_count_24h = 0
    micro_tx_count_1h = 0
    terminals_1h = 0

    final_features = {
        "amount_zscore": amount_zscore,
        "time_since_last_tx_minutes": time_since_last_tx_minutes,
        "card_lifetime_days": card_lifetime_days,
        "terminal_lifetime_days": terminal_lifetime_days,
        "tx_hour": tx_hour,
        "is_weekend": is_weekend,
        "is_night": is_night,
        "card_fraud_rate": card_fraud_rate,
        "spending_velocity_ratio": spending_velocity_ratio,
        "time_since_last_tx_zscore": time_since_last_tx_zscore,
        "tx_count_1h": tx_count_1h,
        "tx_count_24h": tx_count_24h,
        "number_of_transactions": number_of_transactions,
        "terminal_fraud_rate": terminal_fraud_rate,
        "card_num_terminals": card_num_terminals,
        "card_night_rate": card_night_rate,
        "is_first_time_terminal": is_first_time_terminal,
        "is_micro_transaction": is_micro_transaction,
        "micro_tx_count_1h": micro_tx_count_1h,
        "bin_fraud_rate": bin_fraud_rate,
        "terminals_1h": terminals_1h,
        "distance_from_last_location_km": distance_from_last_location_km,
        "velocity_risk_level": velocity_risk_level,
    }

    return final_features