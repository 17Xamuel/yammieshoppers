const express = require("express");
const conn = require("../database/db");
const uuid = require("uuid");
const nodemailer = require("nodemailer");
const router = express.Router();
const charge = require("./charges");

router.post("/updateCart/:id", (req, res) => {
  conn.query(
    "UPDATE customers SET ? where c_id = ?",
    [
      {
        c_cart: req.body[0],
        c_cart_number: req.body[1],
      },
      req.params.id,
    ],
    (err, result) => {
      if (err) throw err;
      res.status(200).send("cart amount upated");
    }
  );
});

module.exports = router;
