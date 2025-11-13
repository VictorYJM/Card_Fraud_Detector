import { useState } from "react";

import type Payer from "../../types/payers";
import type Terminal from "../../types/terminals";
import type Transaction from "../../types/transactions";

interface ManualGenerationProps {
    payers: Payer[];
    terminals: Terminal[];
};

const ManualGeneration = ({ payers, terminals }: ManualGenerationProps) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    return (
        <div>
            {payers.length}
            {terminals.length}
            {transactions.length}
        </div>
    );
};

export default ManualGeneration;