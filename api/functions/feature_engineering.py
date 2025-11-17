from models import TransactionRecord, TransactionProcessed
from datetime import datetime
import numpy as np
MICRO_TRANSACTION = 5



def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calcula a distância entre dois pontos na Terra (especificados em graus decimais)
    usando a fórmula de Haversine.
    """
    # Raio da Terra em quilômetros
    R = 6371.0

    # Converter graus para radianos
    lat1_rad = np.radians(lat1)
    lon1_rad = np.radians(lon1)
    lat2_rad = np.radians(lat2)
    lon2_rad = np.radians(lon2)

    # Diferenças
    dlon = lon2_rad - lon1_rad
    dlat = lat2_rad - lat1_rad

    # Fórmula de Haversine
    a = np.sin(dlat / 2)**2 + np.cos(lat1_rad) * np.cos(lat2_rad) * np.sin(dlon / 2)**2
    c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1 - a))

    distance = R * c
    return distance

def feature_engineering(tx: TransactionRecord) -> TransactionProcessed:
    dt = tx.tx_datetime

    tx_hour = dt.hour
    is_weekend = int(dt.weekday >= 5)
    is_night = 1 if(dt.hour >= 22 or dt.hour < 6) else 0

    card_lifetime_days = tx.tx_datetime - tx.card_first_transaction
    is_micro_transaction = 1 if(tx.tx_amount < MICRO_TRANSACTION) else 0

    last_latitude = pass
    last_longitude = pass

    distance_from_last_location_km = haversine_distance(tx.latitude, tx.longitude)




