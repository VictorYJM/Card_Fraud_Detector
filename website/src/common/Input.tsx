import type React from "react";
import { forwardRef } from "react";

interface InputProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    label?: string;
    labelStyle?: string;
    type: string;
    inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
    pattern?: string;
    maxLength?: number;
    min?: string;
    max?: string;
    readonly?: boolean;
    accept?: string;
    inputStyle?: string;
};

const Input = forwardRef<HTMLInputElement, InputProps>(({
    value,
    onChange,
    placeholder,
    label,
    labelStyle,
    type,
    inputMode,
    pattern,
    maxLength,
    min,
    max,
    readonly,
    accept,
    inputStyle
}, ref) => {
    return (
        <div>
            {label && <label className={labelStyle}>{label}</label>}
            <input
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                type={type}
                inputMode={inputMode}
                pattern={pattern}
                maxLength={maxLength}
                min={min}
                max={max}
                readOnly={readonly}
                accept={accept}
                ref={ref}
                className={inputStyle}
            />
        </div>
    );
});

export default Input;