import { useState, useEffect } from "react";

import type Payer from "../types/payers";
import type Terminal from "../types/terminals";

import Batch from "./validation/Batch";
import Manual from "./validation/Manual";
import ManualGeneration from "./generation/ManualGeneration";
import RandomGeneration from "./generation/RandomGeneration";

const Display = () => {
    const [activeTab, setActiveTab] = useState("single");

    const [payers, setPayers] = useState<Payer[]>([]);
    const [terminals, setTerminals] = useState<Terminal[]>([]);

    useEffect(() => {
        const fetchPayers = async () => {
            try {
                const URL = import.meta.env.VITE_API_PAYERS;
                const response = await fetch(URL);
                if (!response.ok) { throw new Error(`Response status: ${response.status}`); }

                const result = await response.json();
                setPayers(result);
            }

            catch (error) { console.log(error); }
        };

        const fetchTerminals = async () => {
            try {
                const URL = import.meta.env.VITE_API_TERMINALS;
                const response = await fetch(URL);
                if (!response.ok) { throw new Error(`Response status: ${response.status}`); }

                const result = await response.json();
                setTerminals(result);
            }

            catch (error) { console.log(error); }
        };

        fetchPayers();
        fetchTerminals();
    }, []);

    return (
        <div className="flex justify-center items-center mx-20 my-20">
            <div className="max-w-2xl rounded-2xl border-2 border-black overflow-hidden shadow-2xl shadow-gray-300">
                <div className="px-6 py-4">
                    <div className="font-bold text-xl mb-2 text-center">Card Fraud Detection AI</div>
                    <div className="text-gray-700 text-base mt-4">
                        <div className="flex justify-center border-b-2 border-gray-200 mb-4">
                            <button
                                className={`px-4 py-2 text-sm font-medium focus:outline-none transition-colors duration-100 ${
                                    activeTab === "single"
                                        ? "border-b-2 border-blue-500 text-blue-600 mb-[-2px]"
                                        : "text-gray-500 hover:text-gray-900"
                                }`}
                                onClick={() => setActiveTab("single")}
                            >
                                Single Classify
                            </button>

                            <button
                                className={`px-4 py-2 text-sm font-medium focus:outline-none transition-colors duration-100 ${
                                    activeTab === "batch"
                                        ? "border-b-2 border-blue-500 text-blue-600 mb-[-2px]"
                                        : "text-gray-500 hover:text-gray-900"
                                }`}
                                onClick={() => setActiveTab("batch")}
                            >
                                Batch Classify
                            </button>

                            <button
                                className={`px-4 py-2 text-sm font-medium focus:outline-none transition-colors duration-100 ${
                                    activeTab === "manual-generation"
                                        ? "border-b-2 border-blue-500 text-blue-600 mb-[-2px]"
                                        : "text-gray-500 hover:text-gray-900"
                                }`}
                                onClick={() => setActiveTab("manual-generation")}
                            >
                                Manual Transaction Generation
                            </button>

                            <button
                                className={`px-4 py-2 text-sm font-medium focus:outline-none transition-colors duration-100 ${
                                    activeTab === "random-generation"
                                        ? "border-b-2 border-blue-500 text-blue-600 mb-[-2px]"
                                        : "text-gray-500 hover:text-gray-900"
                                }`}
                                onClick={() => setActiveTab("random-generation")}
                            >
                                Random Transaction Generation
                            </button>
                        </div>
                        
                        {activeTab === "single" && <Manual payers={payers} terminals={terminals} />}
                        {activeTab === "batch" && <Batch/>}
                        {activeTab === "manual-generation" && <ManualGeneration payers={payers} terminals={terminals}/>}
                        {activeTab === "random-generation" && <RandomGeneration payers={payers} terminals={terminals} />}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Display;