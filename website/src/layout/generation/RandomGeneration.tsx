import { useMemo, useState } from "react";

import type Payer from "../../types/payers";
import type Terminal from "../../types/terminals";
import type Transaction from "../../types/transactions";

import Input from "../../common/Input";
import Table, { type ColumnDef } from "../../common/Table";

interface RandomGenerationProps {
    payers: Payer[];
    terminals: Terminal[];
};

const RandomGeneration = ({ payers, terminals }: RandomGenerationProps) => {
    const [generationCount, setGenerationCount] = useState<string>("5");
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    const terminalMap = useMemo(() => {
        return terminals.reduce((acc, terminal) => {
            acc[terminal.terminal_id] = terminal.terminal_soft_descriptor;
            return acc;
        }, {} as Record<number, string>);
    }, [terminals]);

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
            header: "Terminal",
            renderCell: (tx) => terminalMap[tx.terminal_id] || "N/A",
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
    ], [terminalMap]);

    const handleGenerate = () => {
        if (payers.length === 0 || terminals.length === 0) { return; }

        const count = parseInt(generationCount, 10);
        if (isNaN(count) || count <= 0) { return; }

        const newTransactions: Transaction[] = [];

        const minTimestamp = new Date("2018-01-01T00:00:10").getTime();
        const maxTimestamp = new Date("2018-05-31T23:59:38").getTime();

        for (let i = 0; i < count; i++) {
            const randomPayer = payers[Math.floor(Math.random() * payers.length)];
            const randomTerminal = terminals[Math.floor(Math.random() * terminals.length)];

            const randomAmount = (Math.random() * 9999 + 1).toFixed(2);

            const randomTimestamp = Math.random() * (maxTimestamp - minTimestamp) + minTimestamp;
            const randomDate = new Date(randomTimestamp);

            newTransactions.push({
                card_id: randomPayer.card_id,
                card_bin: randomPayer.card_bin,
                card_first_transaction: new Date(randomPayer.card_first_transaction),
                terminal_id: randomTerminal.terminal_id,
                latitude: randomTerminal.latitude,
                longitude: randomTerminal.longitude,
                terminal_operation_start: new Date(randomTerminal.terminal_operation_start),
                tx_amount: parseFloat(parseFloat(randomAmount).toFixed(2)),
                tx_datetime: randomDate,
            });
        }

        setTransactions(newTransactions);
    };

    const handleSave = () => {
        if (transactions.length === 0) {
            alert("There's no transaction to save!")
            return;
        }

        const dataStr = JSON.stringify(transactions, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "transactions.json";
        link.click();
    };

    return (
        <div className="w-full">
            {/* Generation Control */}
            <div className="flex items-end gap-4 mb-6">
                <div className="flex-1">
                    <Input
                        value={generationCount}
                        onChange={(e) => {
                            let value = parseInt(e.target.value, 10);
                            if (isNaN(value)) value = 1;
                            if (value < 1) value = 1;
                            if (value > 100) value = 100;
                            setGenerationCount(String(value));
                        }}
                        label="Number of transactions to generate"
                        labelStyle="font-bold block mb-2"
                        type="number"
                        inputStyle="w-full p-2 border-2 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="flex-1">
                    <button 
                        onClick={handleGenerate}
                        className="w-full p-2 bg-blue-500 text-white font-bold rounded-md hover:bg-blue-600 transition-colors"
                    >
                        Generate Transactions
                    </button>
                </div>
            </div>

            {/* Table of Transactions */}
            {transactions.length > 0 && (
                <Table
                    data={transactions}
                    columns={columns}
                    getKey={(tx) => `${tx.card_id}-${tx.tx_datetime.getTime()}`}
                />
            )}

            {/* Save Transactions */}
            <div className="mt-4 flex gap-4 items-start">
                <button
                    onClick={handleSave}
                    className="w-full rounded-2xl border-2 border-black font-bold hover:bg-gray-100 active:bg-gray-200"
                >
                    Save Transactions
                </button>
            </div>
        </div>
    );
};

export default RandomGeneration;