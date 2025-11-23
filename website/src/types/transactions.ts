export default interface Transaction {
    card_id: number;
    card_bin: number;
    card_first_transaction: Date;
    terminal_id: number;
    latitude: number;
    longitude: number;
    terminal_operation_start: Date;
    tx_amount: number;
    tx_datetime: Date;
};