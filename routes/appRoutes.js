const express = require("express");
const conn = require("../database/db");
const uuid = require("uuid");
const nodemailer = require("nodemailer");
const router = express.Router();
const charge = require("./charges");

router.post("/updateCart/:id", (req, res) => {
  console.log(req.body);
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

router.post("/likedItems/:id", async (req, res) => {
  conn.query(
    `SELECT c_liked_items FROM customers WHERE c_id=?`,
    [req.params.id],
    (err, result) => {
      if (err) throw err;
      let items = [];
      if (result[0].c_liked_items !== null) {
        let _items = JSON.parse(result[0].c_liked_items);
        _items.forEach((item) => {
          items.push(item);
        });
        items.push(req.body.product_id);
        conn.query(
          `UPDATE customers SET ? WHERE c_id=?`,
          [
            {
              c_liked_items: JSON.stringify(items),
            },
            req.params.id,
          ],
          (err1, res1) => {
            if (err1) throw err;
            res.send(true);
          }
        );
      } else {
        items.push(req.body.product_id);
        conn.query(
          `UPDATE customers SET ? WHERE c_id=?`,
          [
            {
              c_liked_items: JSON.stringify(items),
            },
            req.params.id,
          ],
          (err2, res2) => {
            if (err2) throw err2;
            res.send(true);
          }
        );
      }
    }
  );
});

router.get("/getLikedItems/:id", async (req, res) => {
  conn.query(
    `SELECT c_liked_items  FROM customers WHERE c_id = ?`,
    [req.params.id],
    (err, result) => {
      if (err) throw err;
      res.send(result);
    }
  );
});

router.post("/removeLikedItem/:id", async (req, res) => {
  conn.query(
    `SELECT c_liked_items FROM  customers WHERE c_id = ?`,
    [req.params.id],
    (err, result) => {
      if (err) throw err;
      let products = [];
      if (result[0].c_liked_items !== null) {
        let items = JSON.parse(result[0].c_liked_items);
        items.forEach((item) => {
          if (item !== req.body.product_id) {
            products.push(item);
          }
        });
        conn.query(
          `UPDATE customers SET ? WHERE c_id=?`,
          [
            {
              c_liked_items: JSON.stringify(products),
            },
            req.params.id,
          ],
          (err1, res1) => {
            if (err1) throw err;
            res.send(true);
          }
        );
      }
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
                let in_price = 0;
                let has_specs = false;
                if (JSON.parse(result_0[0].specifications) != null) {
                  if (key.specs != undefined || key.specs != null) {
                    Object.keys(key.specs).forEach((spec) => {
                      if (spec == "Ingredients" && key.specs[spec] != null) {
                        has_specs = true;
                        key.specs[spec].forEach((i) => {
                          in_price += parseInt(i.price);
                        });
                      }
                      if (spec == "Sizes" && key.specs[spec] != null) {
                        has_specs = true;
                        in_price += parseInt(
                          key.specs[spec][Object.keys(key.specs[spec])[0]]
                        );
                      }
                    });
                  }
                }
                price =
                  has_specs == false
                    ? result_0[0].discount
                      ? (result_0[0].price * (100 - result_0[0].discount)) / 100
                      : result_0[0].price
                    : in_price;
                let charge_obj = {
                  original_price: price,
                  price: price * key.inCartNumber,
                  qty: key.inCartNumber < 3 ? true : false,
                  urgent: true,
                  size: (product.Size == "Big" ? true : false) || false,
                  fragile: (product.Fragile == "Yes" ? true : false) || false,
                  location: "Lira",
                  weight: (product.Weight == "Heavy" ? true : false) || false,
                  user: result[0].zone,
                };

                let fee = new charge(charge_obj).total;
                let round_price =
                  new charge(charge_obj).price * key.inCartNumber;
                total_charge += fee;
                total_price += round_price;
                if (cart_arr.length == i + 1) {
                  res.send({
                    shipping: total_charge,
                    total_price,
                  });
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
        c_cart: req.body.cartItems,
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
