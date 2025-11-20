import os
import pandas as pd
from fastapi import FastAPI
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

from models.TransactionRecord import TransactionRecord

from functions.validation import is_fraud
from functions.feature_engineering import feature_engineering

load_dotenv()

# URLs
payers_url = os.getenv("PAYERS_PATH") or (_ for _ in ()).throw(
    ValueError("PAYERS_PATH missing!")
)
terminals_url = os.getenv("TERMINALS_PATH") or (_ for _ in ()).throw(
    ValueError("TERMINALS_PATH missing!")
)
transactions_url = os.getenv("TRANSACTIONS_PATH") or (_ for _ in ()).throw(
    ValueError("TRANSACTIONS_PATH missing!")
)
app = FastAPI()
payers: pd.DataFrame
terminals: pd.DataFrame
transactions: pd.DataFrame
last_transaction_per_card: pd.DataFrame

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
    global payers, terminals, transactions, last_transaction_per_card

    # Data Loading
    payers = pd.read_parquet(payers_url)
    terminals = pd.read_parquet(terminals_url)
    transactions = pd.read_parquet(transactions_url)

    payers.columns = payers.columns.str.lower().str.strip()
    terminals.columns = terminals.columns.str.lower().str.strip()
    transactions.columns = transactions.columns.str.lower().str.strip()

    payers.rename(columns={"card_hash":"card_id"}, inplace=True)

    df = pd.merge(transactions, payers, left_on="card_id", right_on="card_id")
    df = pd.merge(df, terminals, left_on="terminal_id", right_on="terminal_id")

    df["tx_datetime"] = pd.to_datetime(df["tx_datetime"], utc=True)
    df.drop(columns=["tx_date", "tx_time"], inplace = True)

    last_transaction_per_card = df.loc[df.groupby("card_id")["tx_datetime"].idxmax()]


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

# Transaction classify
@app.post("/classify-transaction")
def classify_transaction(tx: TransactionRecord):
    payer = tx.card_id in payers["card_id"].values
    terminal = tx.terminal_id in terminals["terminal_id"].values

    # Unknown Payer / Card / Terminal
    if not payer or not terminal:
        return {"valid": False, "error": "Invalid data!"}

    features = feature_engineering(tx, last_transaction_per_card)
    is_valid_transaction = not is_fraud(features)

    return {"valid": is_valid_transaction, "error": None}


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

        features = feature_engineering(data, last_transaction_per_card)
        is_valid_transaction = not is_fraud(features)

        results.append({"transaction": data.dict(), "valid": is_valid_transaction, "error": None})

    return {"results": results}