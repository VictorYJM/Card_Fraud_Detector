import React from "react";

export interface ColumnDef<T> {
    header: string;
    renderCell: (item: T) => React.ReactNode;
    cellStyle?: string;
};

interface TableProps<T> {
    data: T[];
    columns: ColumnDef<T>[];
    getKey: (item: T) => string | number;
};

const Table = <T,>({ data, columns, getKey }: TableProps<T>) => {
    if (!data || data.length === 0) { return <p className="text-center text-gray-500 py-4">No transactions to show up.</p>; }

    return (
        <div className="max-h-96 overflow-y-auto border-2 border-gray-200 rounded-lg">
            <table className="w-full text-sm text-left text-gray-700">
                <thead className="text-xs text-gray-800 uppercase bg-gray-100 sticky top-0">
                    <tr>
                        {columns.map((col) => (
                            <th key={col.header} scope="col" className="px-6 py-3">
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {data.map((item) => (
                        <tr key={getKey(item)} className="bg-white border-b hover:bg-gray-50">
                            {columns.map((col) => (
                                <td key={col.header} className={`px-6 py-4 ${col.cellStyle || ''}`}>
                                    {col.renderCell(item)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Table;