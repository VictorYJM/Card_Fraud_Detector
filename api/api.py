import os
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

BASE_DIR = os.path.dirname(__file__)
app = FastAPI()

origins = ["http://localhost:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Leitura dos dados
payers = pd.read_parquet(os.path.join(BASE_DIR, "data/payers.parquet"))
terminals = pd.read_parquet(os.path.join(BASE_DIR, "data/terminals.parquet"))
transactions = pd.read_parquet(os.path.join(BASE_DIR, "data/transactions.parquet"))

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