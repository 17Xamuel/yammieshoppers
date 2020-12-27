const express = require("express");
const conn = require("../database/db");
const uuid = require("uuid");
const nodemailer = require('nodemailer');
const router = express.Router();

//Returns all products
router.get("/allProducts", (req, res) => {
    conn.query(
        `SELECT * FROM products`,
        (err, result) => {
            if (err) {
                throw err;
            } else {
                res.send(result);
            }
        }
    );
});

//Return all pending products
router.get("/pendingProducts", async (req, res) => {
    conn.query(
        "SELECT * FROM pending_products",
        (err, results) => {
            if (err) throw err;
            res.json(results);
        }
    );
});

module.exports = router;
