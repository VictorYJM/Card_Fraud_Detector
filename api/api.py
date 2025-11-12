import os
import pandas as pd
from fastapi import FastAPI
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

payers_url = os.getenv("PAYERS_PATH")
terminals_url = os.getenv("TERMINALS_PATH")
transactions_url = os.getenv("TRANSACTIONS_PATH")

app = FastAPI()

origins = ["http://localhost:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

assert payers_url is not None, "PAYERS_PATH missing!"
assert terminals_url is not None, "TERMINALS_PATH missing!"
assert transactions_url is not None, "TRANSACTIONS_PATH missing!"

payers = pd.read_parquet(payers_url)
terminals = pd.read_parquet(terminals_url)
transactions = pd.read_parquet(transactions_url)


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