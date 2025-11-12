import { useState, useEffect } from "react";

import type Payer from "../types/payers";
import type Terminal from "../types/terminals";

import Manual from "./Manual";
import Random from "./Random";

const Display = () => {
    const [activeTab, setActiveTab] = useState("manual");

    const [payers, setPayers] = useState<Payer[]>([]);
    const [terminals, setTerminals] = useState<Terminal[]>([]);

    useEffect(() => {
        const fetchPayers = async () => {
            try {
                const response = await fetch("http://localhost:8000/payers");
                if (!response.ok) { throw new Error(`Response status: ${response.status}`); }

                const result = await response.json();
                setPayers(result);
            }

            catch (error) { console.log(error); }
        };

        const fetchTerminals = async () => {
            try {
                const response = await fetch("http://localhost:8000/terminals");
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
                    <div className="font-bold text-xl mb-2 text-center">Análise de Fraudes em Cartões</div>
                    <div className="text-gray-700 text-base mt-4">
                        <div className="flex justify-center border-b-2 border-gray-200 mb-4">
                            <button
                                className={`px-4 py-2 text-sm font-medium focus:outline-none transition-colors duration-100 ${
                                    activeTab === "manual"
                                        ? "border-b-2 border-blue-500 text-blue-600 mb-[-2px]"
                                        : "text-gray-500 hover:text-gray-900"
                                }`}
                                onClick={() => setActiveTab("manual")}
                            >
                                Digitados Manualmente
                            </button>
                            <button
                                className={`px-4 py-2 text-sm font-medium focus:outline-none transition-colors duration-100 ${
                                    activeTab === "random"
                                        ? "border-b-2 border-blue-500 text-blue-600 mb-[-2px]"
                                        : "text-gray-500 hover:text-gray-900"
                                }`}
                                onClick={() => setActiveTab("random")}
                            >
                                Gerados Aleatoriamente
                            </button>
                        </div>
                        
                        {activeTab === "manual" 
                            ? <Manual payers={payers} terminals={terminals} /> 
                            : <Random payers={payers} terminals={terminals} />}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Display;