import { useState, useRef, useMemo } from "react";

import type Transaction from "../../types/transactions";

import Input from "../../common/Input";
import Table, { type ColumnDef } from "../../common/Table";

function isTransaction(obj: any): obj is Transaction {
    return (
        typeof obj === "object" && obj !== null &&
        typeof obj.card_id === "number" &&
        typeof obj.terminal_id === "number" &&
        typeof obj.tx_amount === "number" &&
        typeof obj.tx_datetime === "string"
    );
};

const Batch = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const columns = useMemo((): ColumnDef<Transaction>[] => [
        {
            header: "Card ID",
            renderCell: (tx) => tx.card_id,
        },
        {
            header: "Card Bin",
            renderCell: (tx) => tx.card_bin,
        },
        {
            header: "Terminal ID",
            renderCell: (tx) => tx.terminal_id,            
        },
        {
            header: "Data & Hora",
            renderCell: (tx) => tx.tx_datetime.toLocaleString("pt-BR"),
        },
        {
            header: "Valor (R$)",
            renderCell: (tx) => tx.tx_amount.toFixed(2),
            cellStyle: "text-right",
        },
    ], []);

    const handleLoadButtonClick = () => { fileInputRef.current?.click(); };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) { return; }

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result;
            if (typeof text !== "string") {
                alert("Error reading file!");
                return;
            }

            try {
                const data = JSON.parse(text);

                if (!Array.isArray(data) || !data.every(isTransaction)) { throw new Error("Estrutura do JSON inválida."); }
                const formattedTransactions: Transaction[] = data.map(tx => ({
                    ...tx,
                    tx_datetime: new Date(tx.tx_datetime),
                }));
                
                setTransactions(formattedTransactions);
            }
            
            catch (error) {
                alert("Wrong JSON structure!");
                setTransactions([]);
            }
            
            finally { if (event.target) { event.target.value = ""; } }
        };

        reader.readAsText(file);
    };

    const handleClassify = () => {
        alert("API REQUEST NOT AVAILABLE (T-T)")
    };

    return (
        <div className="w-full">
            {/* Hidden Input File Field */}
            <Input
                value=""
                onChange={handleFileChange}
                type="file" 
                accept=".json"
                ref={fileInputRef}
                inputStyle="hidden"
            />
            
            {/* Load Transactions Button */}
            <div className="mb-6 flex gap-4 items-start">
                <button
                    onClick={handleLoadButtonClick}
                    className="w-full rounded-2xl border-2 border-black font-bold hover:bg-gray-100 active:bg-gray-200"
                >
                    Load Transactions
                </button>
            </div>

            {/* Table of Transactions */}
            {transactions.length > 0 && (
                <Table
                    data={transactions}
                    columns={columns}
                    getKey={(tx) => `${tx.card_id}-${tx.tx_datetime.getTime()}`}
                />
            )}

            {/* Classify Transactions */}
            <div className="mt-8 mb-6 flex gap-4 items-start">
                <button
                    onClick={handleClassify}
                    className="w-full rounded-2xl border-2 border-black font-bold hover:bg-gray-100 active:bg-gray-200"
                >
                    Classify Transactions
                </button>
            </div>
        </div>
    );
};

export default Batch;