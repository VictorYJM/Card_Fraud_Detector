export default interface Transaction {
    card_id: number;
    terminal_id: number;
    tx_amount: number;
    tx_datetime: Date;
};