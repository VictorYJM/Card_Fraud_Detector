import React from "react";

interface DropdownProps<T> {
    items: T[];
    onSelectItems: (items: T) => void;
    renderItem: (item: T) => React.ReactNode;
    getKey: (item: T) => string | number;
};

const Dropdown = <T,>({ items, onSelectItems, renderItem, getKey }: DropdownProps<T>) => {
    if (!items || items.length === 0) { return null; }

    return (
        <div className="border border-black max-h-52 overflow-y-auto bg-white rounded-md mt-1 shadow-sm">
            {items.map((item) => (
                <div
                    key={getKey(item)}
                    onClick={() => onSelectItems(item)}
                    className="p-2 cursor-pointer hover:bg-gray-100 transition-colors"
                >
                    {renderItem(item)}
                </div>
            ))}
        </div>
    );
};

export default Dropdown;