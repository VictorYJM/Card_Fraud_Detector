import os
import pandas as pd
from fastapi import FastAPI
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

from api.models.TransactionRecord import TransactionRecord

from api.functions.validation import is_fraud
from api.functions.feature_engineering import feature_engineering

load_dotenv()

# URL to Hidden Data
payers_url = os.getenv("PAYERS_PATH") or (_ for _ in ()).throw(
    ValueError("PAYERS_PATH missing!")
)
terminals_url = os.getenv("TERMINALS_PATH") or (_ for _ in ()).throw(
    ValueError("TERMINALS_PATH missing!")
)
transactions_url = os.getenv("TRANSACTIONS_PATH") or (_ for _ in ()).throw(
    ValueError("TRANSACTIONS_PATH missing!")
)
# last_transactions_url = os.getenv("LAST_TRANSACTIONS_PATH") or (_ for _ in ()).throw(ValueError("LAST_TRANSACTIONS_PATH missing!"))
app = FastAPI()
payers: pd.DataFrame
terminals: pd.DataFrame
transactions: pd.DataFrame
last_transactions: pd.DataFrame

# CORS configs
origins = ["https://victoryjm-card-fraud-detection.hf.space"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def load_data():
    global payers, terminals, transactions

    # 1. Data Loading
    payers = pd.read_parquet(payers_url)
    terminals = pd.read_parquet(terminals_url)
    transactions = pd.read_parquet(transactions_url)

    # last_transactions = pd.read_parquet(last_transactions_url)

    # 2. Data formatting
    # payers = payers.drop(columns="card_first_transaction")
    # terminals = terminals.drop(columns=["latitude", "longitude", "terminal_operation_start"])


# Payers / Cards GET
@app.get("/payers")
def get_payers():
    return payers.to_dict(orient="records")


# Terminals GET
@app.get("/terminals")
def get_terminals():
    return terminals.to_dict(orient="records")


# Transactions GET
@app.get("/transactions")
def get_transactions():
    return transactions.to_dict(orient="records")


# Last Transaction per card
# @app.get("/last-transactions")
# def get_last_transactions():
#     return last_transactions.to_dict(orient="records")


# Transaction classify
@app.post("/classify-transaction")
def classify_transaction(tx: TransactionRecord):
    payer = tx.card_id in payers["card_id"].values
    terminal = tx.terminal_id in terminals["terminal_id"].values

    # Unknown Payer / Card / Terminal
    if not payer or not terminal:
        return {"valid": False, "error": "Invalid data!"}

    feature_engineering(tx, last_transactions)
    response: bool = is_fraud(tx)

    return {"valid": response, "error": None}


@app.post("/classify-transactions")
def classify_transactions(txs: list[TransactionRecord]):
    results = []
    for data in txs:
        payer = data.card_id in payers["card_id"].values
        terminal = data.terminal_id in terminals["terminal_id"].values

        # Unknown Payer / Card / Terminal
        if not payer or not terminal:
            results.append(
                {"transaction": data.dict(), "valid": False, "error": "Invalid data!"}
            )
            continue

        feature_engineering(data)
        response: bool = is_fraud(data)

        results.append({"transaction": data.dict(), "valid": response, "error": None})

    return {"results": results}
