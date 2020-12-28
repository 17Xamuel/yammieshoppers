const express = require("express");
const conn = require("../database/db");
const uuid = require("uuid");
const nodemailer = require('nodemailer');
const router = express.Router();

// Generate Order Number
function rs(l) {
    var rc = "abcdefgh14";
    var r = "";
    for (var i = 0; i < l; i++) {
        r += rc.charAt(Math.floor(Math.random() * rc.length));
    }
    let date = new Date();
    return (
        (date.getDate() < 10
            ? "0" + date.getDate().toString()
            : date.getDate().toString()) +
        (date.getMonth() + 1).toString() +
        r
    );
}
// Place anOrder
router.post("/placeOrder", async (req, res) => {
    const [
        order_payment_method,
        c_id,
        order_items,
        order_amount,
        order_delivery_method,
    ] = req.body;
    conn.query(
        "INSERT INTO pending_orders SET ? ",
        {
            order_id: uuid.v4(),
            order_items,
            order_delivery_method,
            order_amount,
            order_payment_method,
            c_id,
            order_number: rs(5),
            order_date: new Date(),
        },
        (err, result) => {
            if (err) throw err;
            res.send(order_payment_method);
        }
    );
});
//PendingOrders
router.get("/pendingOrders", async (req, res) => {
    conn.query(`SELECT * FROM pending_orders`, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

module.exports = router;
