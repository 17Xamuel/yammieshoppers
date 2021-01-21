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
        c_cart: req.body.cart,
        c_cart_number: parseInt(req.body.cartNumber),
      },
      req.params.id,
    ],
    (err, result) => {
      if (err) throw err;
      if (result.affectedRows > 0) res.status(200).send("cart amount upated");
    }
  );
});

router.get("/checkout/cart/:id", (req, res) => {
  conn.query(
    `SELECT c_cart_amount,c_cart,c_cart_number,zone
      FROM customers JOIN customer_address
      ON customer_address.c_id = customers.c_id WHERE customers.c_id = ?`,
    req.params.id,
    (err, result) => {
      if (err) {
        throw err;
      } else {
        console.log(result[0].c_cart);
        console.log(typeof result[0].c_cart);
        let cart = JSON.parse(result[0].c_cart);
        let total_charge = 0;
        let total_price = 0;
        let cart_arr = Object.values(cart);
        for (let i = 0; i < cart_arr.length; i++) {
          let key = cart_arr[i];
          conn.query(
            `SELECT * FROM products WHERE id = ?`,
            key.cartItemAdded,
            (error, result_0) => {
              if (error) {
                throw error;
              } else {
                let _charge = 0;
                let product =
                  JSON.parse(result_0[0].specifications) == null
                    ? { Size: "small", Fragile: "No", weight: "light" }
                    : JSON.parse(result_0[0].specifications);

                let charge_obj = {
                  price: result_0[0].discount
                    ? (result_0[0].price * (100 - result_0[0].discount)) / 100
                    : result_0[0].price,
                  qty: key.inCartNumber < 4 ? "few" : "many",
                  urgent: true,
                  size: product.Size || "small",
                  fragile: (product.Fragile == "Yes" ? true : false) || false,
                  location: "Lira",
                  weight: product.Weight || "Light",
                  user: result[0].zone,
                };

                let fee = new charge(charge_obj).total;
                let price = new charge(charge_obj).price;
                total_charge += fee;
                total_price += price * key.inCartNumber;
                if (cart_arr.length == i + 1) {
                  console.log({ shipping: total_charge, total_price });
                  res.send({ shipping: total_charge, total_price });
                }
              }
            }
          );
        }
      }
    }
  );
});

router.post("/customer/cart/amount/:id", (req, res) => {
  conn.query(
    "UPDATE customers SET ? where c_id = ?",
    [
      {
        c_cart_amount: parseInt(req.body.total),
        c_cart:
          typeof req.body.cartItems == "string"
            ? req.body.cart
            : JSON.stringify(req.body.cartItems),
        c_cart_number: parseInt(req.body.inCart),
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
