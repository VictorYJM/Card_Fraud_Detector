import type Transaction from "./transactions";

export default interface ApiResponse {
    valid: boolean;
    error: string | null;
    transaction?: Transaction
}