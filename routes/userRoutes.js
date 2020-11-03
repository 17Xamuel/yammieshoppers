const express = require("express");
const conn = require("../database/db");
const uuid = require("uuid");
const router = express.Router();

router.post("/customer/insert", async (req, res) => {
  conn.query(
    `SELECT c_email FROM customers WHERE c_email = ?`,
    [req.body.c_email],
    (err, results) => {
      if (err) throw err;
      if (results.length > 0) {
        return res.status(401).send("This Email was Used");
      } else {
        let {
          c_email,
          c_gender,
          c_phone,
          c_password,
          c_first_name,
          c_last_name,
        } = req.body;
        let c_id = uuid.v4();
        let newUser = {
          c_id,
          c_email,
          c_gender,
          c_phone,
          c_password,
          c_first_name,
          c_last_name,
        };
        conn.query("INSERT INTO customers SET ?", newUser, (err) => {
          if (err) {
            return res.send("Error in Registering");
          } else {
            conn.query(
              "INSERT INTO customer_address SET c_id = ?",
              newUser.c_id,
              (error) => {
                if (error) throw error;
              }
            );
            res.send("inserted");
          }
        });
      }
    }
  );
});

router.get("/search", async (req, res) => {
  let query = req.query.q;
  let patt = /\W/g;
  let checkQuery = patt.test(query);
  if (checkQuery == true) {
    res.send([]);
    return;
  } else {
    conn.query(
      `SELECT * FROM products 
        WHERE product LIKE '%${query}%' 
          OR brand LIKE '%${query}%'
          OR description LIKE '%${query}%'`,
      (err, result) => {
        if (err) throw err;
        res.send(result);
      }
    );
  }
});

router.post("/customer/lg", (req, res) => {
  conn.query(
    "SELECT c_email, c_password, c_phone, c_id AS yammie FROM customers WHERE c_email = ? OR c_phone = ?",
    [req.body.login, req.body.login],
    (err, result) => {
      if (err) throw err;
      if (result.length == 0) {
        return res.send("no email");
      }
      const password = result.find((c) => c.c_password == req.body.auth);
      if (password) {
        return res.send(password);
      } else {
        res.send("Wrong Password Used");
      }
    }
  );
});
router.get("/customer/:id", (req, res) => {
  conn.query(
    "SELECT * FROM customers WHERE c_id = ?",
    [req.params.id],
    (err, result) => {
      if (err) throw err;
      res.send(result);
    }
  );
});
router.post("/customer/cart/amount/:id", (req, res) => {
  conn.query(
    "UPDATE customers SET c_cart_amount = ? where c_id = ?",
    req.body,
    (err, result) => {
      if (err) throw err;
      res.status(200).send("cart amount upated");
    }
  );
});
router.get("/customer/cart/amount/:id", (req, res) => {
  conn.query(
    "SELECT c_cart_amount FROM customers WHERE c_id = ?",
    [req.params.id],
    (err, result) => {
      if (err) throw err;
      res.status(200).send(result);
    }
  );
});

// new order
router.post("/customer/order", (req, res) => {
  const [
    order_payment_method,
    c_id,
    order_items,
    order_amount,
    order_delivery_method,
    order_number,
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
      order_number,
    },
    (err, result) => {
      if (err) throw err;
      res.send(order_payment_method);
    }
  );
});

//trending category items
// route-->/category/category(name)/nature(trending, headsets,..etc)
router.get("/ct/:ct/:nature", (req, res) => {
  conn.query("SELECT * FROM products", (err, result) => {
    if (err) throw err;
    res.status(200).send(result);
  });
});
router.post("/customer/edit/:id", (req, res) => {
  conn.query(
    "UPDATE customers SET ? WHERE c_id = ? ",
    [req.body, req.params.id],
    (err, results) => {
      if (err) {
        throw "error: " + err;
      } else {
        res.send("Changed");
      }
    }
  );
});
router.get("/account/address/:id", (req, res) => {
  conn.query(
    `SELECT * FROM customer_address
      JOIN customers
      ON customer_address.c_id = customers.c_id
        WHERE customer_address.c_id = ? `,
    req.params.id,
    (err, result) => {
      if (err) throw err;
      res.status(200).send(result);
    }
  );
});
router.post("/account/address/edit/:id", (req, res) => {
  conn.query(
    `SELECT * FROM customer_address WHERE c_id = ?`,
    [req.params.id],
    (err, result) => {
      if (err) throw err;
      let newAddress = {};
      if (result.length == 0) {
        newAddress.c_id = req.params.id;
        newAddress.pickup_address_1 =
          req.body.type == "Primary" ? req.body.add : "";
        newAddress.pickup_address_2 =
          req.body.type == "Primary" ? "" : req.body.add;
        conn.query(
          `INSERT INTO customer_address SET ? `,
          newAddress,
          (error, results) => {
            if (error) throw "err: " + error;
            res.send("Changed");
          }
        );
      } else {
        if (req.body.type == "Primary") {
          newAddress.pickup_address_1 = req.body.add;
        } else {
          newAddress.pickup_address_2 = req.body.add;
        }
        conn.query(
          `UPDATE customer_address SET ? WHERE c_id = ?`,
          [newAddress, req.params.id],
          (error, results) => {
            if (error) throw error;
            res.send("Changed");
          }
        );
      }
    }
  );
});
module.exports = router;
