import { useMemo, useState } from "react";

import type Payer from "../../types/payers";
import type Terminal from "../../types/terminals";
import type Transaction from "../../types/transactions";

import Input from "../../common/Input";

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
                terminal_id: randomTerminal.terminal_id,
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
                        Generate data
                    </button>
                </div>
            </div>

            {/* Table of Results */}
            {transactions.length > 0 && (
                <div className="max-h-96 overflow-y-auto border-2 border-gray-200 rounded-lg">
                    <table className="w-full text-sm text-left text-gray-700">
                        <thead className="text-xs text-gray-800 uppercase bg-gray-100 sticky top-0">
                            <tr>
                                <th scope="col" className="px-6 py-3">Card ID</th>
                                <th scope="col" className="px-6 py-3">Terminal</th>
                                <th scope="col" className="px-6 py-3">Date and Time</th>
                                <th scope="col" className="px-6 py-3 text-right">Amount (R$)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((tx, index) => (
                                <tr key={index} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4">{tx.card_id}</td>
                                    <td className="px-6 py-4">{terminalMap[tx.terminal_id]}</td>
                                    <td className="px-6 py-4">
                                        {tx.tx_datetime.toLocaleString("pt-BR")}
                                    </td>
                                    <td className="px-6 py-4 text-right">{tx.tx_amount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Save Transactions */}
            <div className="mt-4 flex gap-4 items-start">
                <button
                    onClick={handleSave}
                    className="w-full rounded-2xl border-2 border-black font-bold hover:bg-gray-100 active:bg-gray-200"
                >
                    Save data
                </button>
            </div>
        </div>
    );
};

export default RandomGeneration;