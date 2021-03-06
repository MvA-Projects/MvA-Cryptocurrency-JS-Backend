const express = require('express')
const app = express()
const port = 3000

var cors = require('cors')

app.use(cors())

const init = 50;

app.get('/', (req, res) => res.send({
    "status": "Running"
}))

//log in
app.get('/login/:address/:password', (req, res) => {
    let address = req.params.address;
    let password = req.params.password;

    for (let i = 0; i < wallets.length; i++) {
        if (wallets[i].address == address && wallets[i].password == password) {
            res.send({
                "status": "success",
                "address": wallets[i].address
            });
            return;
        }
    }
    res.send({
        "status": "Error"
    });
});

//info
app.get('/information/:address', (req, res) => {
    let address = req.params.address;
    if (address != undefined) {
        for (let i = 0; wallets.length; i++) {
            if (wallets[i].address == address) {
                res.send({
                    "address": wallets[i].address,
                    "balance": wallets[i].balance,
                    "history": wallets[i].history
                })
            }

        }
    } else {
        res.send({
            "status": "Error"
        })
    }


})

//register
app.get('/create/:password', (req, res) => {
    let password = req.params.password;

    let wallet = new Wallet(password, init);
    wallets.push(wallet);

    res.send({
        "status": "Success",
        "address": wallet.address
    });
});

//full view
app.get('/balances', (req, res) => {
    let string = "";

    for (let i = 0; i < wallets.length; i++) {
        string += wallets[i].address + ": " + wallets[i].balance + "   <----->   ";
    }

    res.send({
        "balances": "+" +
            string
    });
});

//check hash
app.get('/hash/:hash', (req, res) => {
    for (let i = 0; i < ledger.length; i++) {
        if (ledger[i].hash == req.params.hash) {
            res.send({
                "hash": ledger[i].hash,
                "from": ledger[i].from,
                "to": ledger[i].to,
                "amount": ledger[i].amount
            })
        }
    }

    res.send({
        "status": "Error"
    })
})

app.get('/ledger', (req, res) => {
    let l = []

    for (let i = 0; i < ledger.length; i++) {
        if (ledger[i].hash != undefined) {
            l.push(ledger[i])
        }
    }

    res.send({
        "Ledger": l
    })
})

//transfer
app.get('/transfer/:from/:to/:amount/:password', (req, res) => {
    let from = req.params.from;
    let to = req.params.to;
    let amount = req.params.amount;
    let password = req.params.password;

    let s; //sender
    let r; //recipient

    for (let i = 0; i < wallets.length; i++) {
        if (wallets[i].address == from) {
            if (password == wallets[i].password) {
                s = wallets[i];
            }
        }
        if (wallets[i].address == to) {
            r = wallets[i];
        }
    }

    if (s != null && r != null) {
        let status = s.transfer(r.address, amount);
        if (status == true) {
            res.send({
                "status": "success"
            })
        } else {
            res.send({
                "status": "Error: " + status
            });
        }
    } else {
        res.send({
            "status": "Error. Sender or Recipient not found."
        });
    }
})

app.listen(port, () => console.log(`Backend running on port: ${port}!`))

//setinterval
setInterval(() => {
    for (let i = 0; i < wallets.length; i++) {
        wallets[i].calculateBalance();
    }
});

//Ledger <- Transactions <- Data
let ledger = [];
let wallets = [];

class Wallet {
    constructor(password, initialbalance) {
        this.address = this.calculateAddress();
        this.password = password;
        let transaction = new Transaction("admin", this.address, init);
        ledger.push(transaction);
        this.balance = this.calculateBalance();
        this.history = [];
    }

    calculateBalance() {
        let history = [];

        let minus = 0;
        let plus = 0;

        for (let i = 0; i < ledger.length; i++) {
            if (ledger[i].from == this.address) {
                minus = parseFloat(minus) + parseFloat(ledger[i].amount);
                history.push(ledger[i]);
            }
            if (ledger[i].to == this.address) {
                plus = parseFloat(plus) + parseFloat(ledger[i].amount);
                history.push(ledger[i]);
            }
        }

        let balance = plus - minus;
        this.balance = balance;
        this.history = history;
    }

    calculateAddress() {
        let string = "MvA";

        let options = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

        for (let i = 0; i < 13; i++) {
            let addition = options[Math.round(Math.random() * (options.length - 1))]
            if (addition != undefined) {
                string += addition;
            } else {
                string += "4";
            }
        }

        return string;
    }

    transfer(address, amount) {
        for (let i = 0; i < wallets.length; i++) {
            if (wallets[i].address == address) {
                if (this.balance >= amount) {
                    let transaction = new Transaction(this.address, address, amount);
                    ledger.push(transaction);
                    return true;
                } else {
                    return "Insufficient Balance"
                }
            }
        }

        return "Recipient Not Found"
    }

}

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

        return timestamp + "-" + string;
    }

}