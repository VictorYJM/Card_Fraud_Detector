import React, { useState, useEffect, useMemo, useRef } from "react";

import type Payer from "../../types/payers";
import type Terminal from "../../types/terminals";
import type ApiResponse from "../../types/ApiResponse";
import type Transaction from "../../types/transactions";

import Input from "../../common/Input";
import Dropdown from "../../common/Dropdown";

interface ManualProps {
    payers: Payer[];
    terminals: Terminal[];
};

const Manual = ({ payers, terminals }: ManualProps) => {
    const [cardSearch, setCardSearch] = useState<string>("");
    const [terminalSearch, setTerminalSearch] = useState<string>("");

    const [cardSelected, setCardSelected] = useState<string>("");
    const [terminalSelected, setTerminalSelected] = useState<string>("");

    const [cardBin, setCardBin] = useState<string>("");
    const [transactionDatetime, setTransactionDatetime] = useState<string>(() => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 19);
    });
    const [transactionAmount, setTransactionAmount] = useState<string>("0.01");

    const [showCardDropdown, setShowCardDropdown] = useState<boolean>(false);
    const [showTerminalDropdown, setShowTerminalDropdown] = useState<boolean>(false);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);

    const cardDropdownRef = useRef<HTMLDivElement | null>(null);
    const terminalDropdownRef = useRef<HTMLDivElement | null>(null);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (cardDropdownRef.current && !cardDropdownRef.current.contains(event.target as Node)) { setShowCardDropdown(false); }
            if (terminalDropdownRef.current && !terminalDropdownRef.current.contains(event.target as Node)) { setShowTerminalDropdown(false); }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (cardSelected) {
            const selectedPayer = payers.find(p => String(p.card_id) === cardSelected);
            if (selectedPayer) { setCardBin(String(selectedPayer.card_bin)); }
        }

        else { setCardBin(""); }
    }, [cardSelected, payers])

    const filteredPayers = useMemo(() => {
        if (!cardSearch) { return []; }

        const initialFiltering = payers.filter((payer) => String(payer.card_id).toLowerCase().startsWith(cardSearch.toLowerCase()));
        if (initialFiltering.length === 1 && String(initialFiltering[0].card_id).toLowerCase() === cardSearch.toLowerCase()) { return []; }

        return initialFiltering;
    }, [cardSearch, payers]);

    const filteredTerminals = useMemo(() => {
        if (!terminalSearch) { return []; }

        const initialFiltering = terminals.filter((terminal) => terminal.terminal_soft_descriptor.toLowerCase().startsWith(terminalSearch.toLowerCase()));
        if (initialFiltering.length === 1 && initialFiltering[0].terminal_soft_descriptor.toLowerCase() === terminalSearch.toLowerCase()) { return []; }

        return initialFiltering;
    }, [terminalSearch, terminals]);

    const handleDatetimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (!value) {
            setTransactionDatetime("");
            return;
        }
        
        const selectedDate = new Date(value);

        if (isNaN(selectedDate.getTime())) { return; }

        let finalDate = selectedDate;        

        const year = finalDate.getFullYear();
        const month = String(finalDate.getMonth() + 1).padStart(2, "0");
        const day = String(finalDate.getDate()).padStart(2, "0");
        const hours = String(finalDate.getHours()).padStart(2, "0");
        const minutes = String(finalDate.getMinutes()).padStart(2, "0");
        const seconds = String(finalDate.getSeconds()).padStart(2, "0");

        const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
        setTransactionDatetime(formattedDate);
    };

    const handleClassify = async () => {
        if (!cardSelected || !cardBin || !terminalSelected) {
            alert("Please fill in all card and terminal fields.");
            return;
        }

        setApiResponse(null);
        setIsLoading(true);

        const payer: Payer | undefined = payers.find(p => String(p.card_id) === cardSearch);
        const terminal: Terminal | undefined = terminals.find(t => t.terminal_soft_descriptor === terminalSearch);

        if (!payer || !terminal) {
            alert("Payer or Terminal not found based on the text fields!");
            setIsLoading(false);
            return;
        }

        const transaction: Transaction = {
            card_id: payer.card_id,
            card_bin: payer.card_bin,
            card_first_transaction: new Date(payer.card_first_transaction),
            terminal_id: terminal.terminal_id,
            latitude: terminal.latitude,
            longitude: terminal.longitude,
            terminal_operation_start: new Date(terminal.terminal_operation_start),
            tx_amount: parseFloat(transactionAmount),
            tx_datetime: new Date(transactionDatetime)
        };

        console.log(transaction)
        
        try {
            const URL = import.meta.env.VITE_API_CLASSIFY_TRANSACTION;
            const HF = import.meta.env.VITE_API_HUGGING_FACE;

            const response = await fetch(URL, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${HF}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(transaction),
            });

            if (!response.ok) { throw new Error(`API Error: ${response.statusText}`); }

            const result: ApiResponse = await response.json();
            setApiResponse(result);
        }

        catch (error) {
            setApiResponse({
                valid: false,
                error: "Failed to connect to the server. Please try again."
            });
        }

        finally { setIsLoading(false); }
    };

    return (
        <div className="w-full">
            {/* Card */}
            <div className="flex gap-4 items-start">
                {/* Card ID */}
                <div className="flex-1" ref={cardDropdownRef}>
                    <Input
                        value={cardSearch}
                        onChange={(e) => {
                            const value = e.target.value;
                            setCardSearch(value);
                            setShowCardDropdown(true);
                            
                            const exactMatch = payers.find(p => String(p.card_id) === value);

                            (exactMatch) ? setCardSelected(value) : setCardSelected("")
                        }}
                        placeholder="Type to search for card..."
                        label="Card ID"
                        labelStyle="font-bold block mb-2"
                        type="number"
                        inputStyle="w-full p-2 border-2 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    
                    {showCardDropdown && (
                        <Dropdown
                            items={filteredPayers}
                            getKey={(payer) => payer.card_id}
                            renderItem={(payer) => <>{payer.card_id}</>}
                            onSelectItems={(payer) => {
                                setCardSearch(String(payer.card_id));
                                setCardSelected(String(payer.card_id));
                                setShowCardDropdown(false);
                            }}
                        />
                    )}
                </div>

                {/* Card Bin */}
                <div className="flex-1">
                    <Input
                        value={cardBin}
                        onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "");
                            if (value.length <= 6) { setCardBin(value); }
                        }}
                        placeholder="000000"
                        label="Card Bin"
                        labelStyle="font-bold block mb-2"
                        type="text"
                        inputMode="numeric"
                        pattern="\d{6}"
                        maxLength={6}
                        readonly={true}
                        inputStyle="w-full p-2 border-2 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
                    />
                </div>
            </div>

            {/* Terminal ID */}
            <div className="mt-4 flex-1" ref={terminalDropdownRef}>
                <Input
                    value={terminalSearch}
                    onChange={(e) => {
                        setTerminalSearch(e.target.value);
                        setShowTerminalDropdown(true);
                    }}
                    placeholder="Type to search for terminal..."
                    label="Terminal"
                    labelStyle="font-bold block mb-2"
                    type="text"
                    maxLength={100}
                    inputStyle="w-full p-2 border-2 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {showTerminalDropdown && (
                    <Dropdown
                        items={filteredTerminals}
                        getKey={(terminal) => terminal.terminal_id}
                        renderItem={(terminal) => (
                            <>
                                {terminal.terminal_soft_descriptor} 
                                <span className="text-gray-500 ml-2">(ID: {terminal.terminal_id})</span>
                            </>
                        )}
                        onSelectItems={(terminal) => {
                            setTerminalSearch(terminal.terminal_soft_descriptor);
                            setTerminalSelected(String(terminal.terminal_id));
                            setShowTerminalDropdown(false);
                        }}
                    />
                )}
            </div>

            {/* Transaction Datetime */}
            <div className="mt-4 flex-1">
                <Input
                    value={transactionDatetime}
                    onChange={handleDatetimeChange}
                    label="Transaction Date & Time"
                    labelStyle="font-bold block mb-2"
                    type="datetime-local"
                    inputStyle="w-full p-2 border-2 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Transaction Amount */}
            <div className="mt-4 flex-1">
                <Input
                    value={transactionAmount}
                    onChange={(e) => {
                        let value = parseFloat(e.target.value);
                        if (isNaN(value)) { value = 0; }
                        if (value <= 0) { value = 0.01; }
                        if (value > 10000) { value = 10000; }
                        setTransactionAmount(value.toFixed(2));
                    }}
                    label="Transaction Amount (R$)"
                    labelStyle="font-bold block mb-2"
                    type="number"
                    inputStyle="w-full p-2 border-2 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Response Fields */}
            <div className="mt-4 flex gap-4 items-start">
                <div className="w-2/5">
                    <button
                        onClick={handleClassify}
                        className="w-full rounded-2xl border-2 border-black font-bold hover:bg-gray-100 active:bg-gray-200"
                    >
                        Classify Transaction
                    </button>
                </div>

                <div className="w-3/5 text-center border-2 border-black font-bold">
                    {!apiResponse && !isLoading && <label>RESPONSE</label>}
                    {isLoading && <label>Loading...</label>}
                    {apiResponse && (
                        <div className={`font-bold ${apiResponse.valid ? "text-green-600" : "text-red-600"}`}>
                            {apiResponse.error ? `Error: ${apiResponse.error}` : `Transaction is ${apiResponse.valid ? "VALID" : "INVALID"}`}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Manual;
