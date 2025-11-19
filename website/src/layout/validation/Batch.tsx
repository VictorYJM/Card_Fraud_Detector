import { useState, useRef, useMemo } from "react";

import type ApiResponse from "../../types/ApiResponse";
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

    const [classificationResults, setClassificationResults] = useState<ApiResponse[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const columns = useMemo((): ColumnDef<Transaction>[] => [
        { header: "Card ID", renderCell: (tx) => tx.card_id },
        { header: "Card Bin", renderCell: (tx) => tx.card_bin },
        { header: "Terminal ID", renderCell: (tx) => tx.terminal_id },
        { header: "Date and Time", renderCell: (tx) => tx.tx_datetime.toLocaleString("pt-BR") },
        { header: "Amount (R$)", renderCell: (tx) => tx.tx_amount.toFixed(2), cellStyle: "text-right" },

        {
            header: "Result",
            renderCell: (tx) => {
                const result = classificationResults.find(
                    (res) => res.transaction &&
                    res.transaction.card_id === tx.card_id &&
                    new Date(res.transaction.tx_datetime).getTime() === tx.tx_datetime.getTime()
                );

                if (!result) { return <span className="text-gray-400">-</span>; }
                if (result.error) { return <span className="text-yellow-600 font-bold">{result.error}</span>; }
                
                return (
                    <span className={result.valid ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                        {result.valid ? "Válida" : "Inválida"}
                    </span>
                );
            },
            cellStyle: "text-center font-bold",
        }
    ], [classificationResults]);

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
                setClassificationResults([]);
            }
            
            catch (error) {
                alert("Wrong JSON structure!");
                setTransactions([]);
            }
            
            finally { if (event.target) { event.target.value = ""; } }
        };

        reader.readAsText(file);
    };

    const handleClassify = async () => {
        if (transactions.length === 0) {
            alert("Please load transactions first.");
            return;
        }

        setIsLoading(true);
        setClassificationResults([]);

        const transactionsForApi = transactions.map(tx => ({
            ...tx,
            tx_datetime: tx.tx_datetime.toISOString(),
        }));

        try {
            const URL = import.meta.env.VITE_API_CLASSIFY_TRANSACTIONS;
            const HF = import.meta.env.VITE_API_HUGGING_FACE;

            const response = await fetch(URL, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${HF}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(transactionsForApi),
            });

            if (!response.ok) throw new Error(`API Error: ${response.statusText}`);

            const data: { results: ApiResponse[] } = await response.json();
            setClassificationResults(data.results);
        }
        
        catch (error) {
            console.error("Failed to classify transactions:", error);
            alert("Failed to connect to the server. Please try again.");
        }
        
        finally { setIsLoading(false); }
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
            {transactions.length > 0 && (
                <div className="mt-8 mb-6 flex gap-4 items-start">
                    <button
                        onClick={handleClassify}
                        disabled={isLoading}
                        className="w-full rounded-2xl border-2 border-black font-bold p-3 hover:bg-gray-100 active:bg-gray-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "Classifying..." : "Classify Transactions"}
                    </button>
                </div>
            )}
        </div>
    );
};

export default Batch;