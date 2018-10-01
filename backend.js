//Ledger <- Transactions <- Data
let ledger = [];

class Transaction {
    constructor(from, to, amount) {
        this.from = from;
        this.to = to;
        this.amount = amount;
        this.hash = this.calculateHash();
    }

    calculateHash() {
        //101-2018-122<->MaxTest50 - 10/1/2018 12:02 From Max To Test 50 Coins
        let string = this.from + this.to + this.amount;
        let d = new Date();
        let timestamp = (parseInt(d.getMonth() + 1)).toString() + d.getDate().toString() + "-" + d.getFullYear().toString() + "-" + d.getHours().toString() + d.getMinutes().toString();

        return timestamp + "<->" + string;
    }

}