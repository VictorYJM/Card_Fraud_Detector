import os
import pandas as pd
from fastapi import FastAPI
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

payers_url = os.getenv("PAYERS_PATH") or (_ for _ in ()).throw(ValueError("PAYERS_PATH missing!"))
terminals_url = os.getenv("TERMINALS_PATH") or (_ for _ in ()).throw(ValueError("TERMINALS_PATH missing!"))
transactions_url = os.getenv("TRANSACTIONS_PATH") or (_ for _ in ()).throw(ValueError("TRANSACTIONS_PATH missing!"))

app = FastAPI()

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

    # 1. Obtenção dos dados
    payers = pd.read_parquet(payers_url)
    terminals = pd.read_parquet(terminals_url)
    transactions = pd.read_parquet(transactions_url)

    # 2. Formatação dos dados
    payers = payers.drop(columns="card_first_transaction")
    terminals = terminals.drop(columns=["latitude", "longitude", "terminal_operation_start"])

@app.get("/payers")
def get_payers():
    return payers.to_dict(orient="records")

@app.get("/terminals")
def get_terminals():
    return terminals.to_dict(orient="records")

@app.get("/transactions")
def get_transactions():
    return transactions.to_dict(orient="records")

@app.get("/validate-transaction")
def validate_transaction():
    pass

@app.get("/validate-transactions")
def validate_transactions():
    pass