const express = require("express");
const uuid = require("uuid");
const conn = require("../database/db.js");
const bycrpt = require("bcryptjs");
const nodemailer = require("nodemailer");
require("dotenv").config();

const router = express.Router();
let newSeller = {};
let code = Math.floor(Math.random() * 1000000 + 1).toString();

let transporter = nodemailer.createTransport({
  host: "smtp.domain.com",
  secureConnection: false,
  port: 465,
  auth: {
    user: "info@yammieshoppers.com",
    pass: "yammieShoppers@1"
  }
});

router.post("/registerSeller", async (req, res) => {
  let {
    username,
    email,
    phonenumber,
    category,
    businessname,
    password,
    passwordConfirm,
    location
  } = req.body;

  if (
    username.length <= 0 ||
    email.length <= 0 ||
    phonenumber.length <= 0 ||
    password.length <= 0 ||
    passwordConfirm.length <= 0 ||
    businessname.length <= 0 ||
    category.length <= 0 ||
    location.length <= 0
  ) {
    return res.send("All Fields are Required");
  }
  conn.query(
    `SELECT email FROM pending_sellers WHERE email=?`,
    [email],
    (err, result) => {
      if (err) throw err;
      conn.query(
        `SELECT email FROM sellers WHERE email=?`,
        [email],
        (errs, queryRes) => {
          if (errs) throw errs;
          let answer = result.length + queryRes.length;
          if (answer > 0) {
            return res.send("Email Already in Use.");
          }
        }
      );
    }
  );
  if (password.length < 5) {
    return res.send("Password must be more than 5 characters");
  } else if (password != passwordConfirm) {
    return res.send("Password Mismatch");
  }

  let id = uuid.v4();
  password = await bycrpt.hash(password, 1);
  category = JSON.stringify(category);
  newSeller = {
    id,
    username,
    email,
    phonenumber,
    businessname,
    location,
    category,
    password
  };

  let mailOptions = {
    from: '"Yammie Shoppers"<info@yammieshoppers.com>',
    to: email,
    subject: "Email Confirmation",
    text: `Hello, ${username} confirm your email with this code ${code}.`
  };

  transporter.sendMail(mailOptions, (error, response) => {
    if (error) {
      console.log(error);
      return res.send(
        "We are sorry something went wrong.Please  check your email"
      );
    } else {
      res.status(200).send("Email Sent");
    }
  });
});

router.post("/confirmEmail", async (req, res) => {
  if (req.body.fn == code) {
    conn.query(
      "INSERT INTO pending_sellers SET ? ",
      newSeller,
      (err, result) => {
        if (err) throw err;
        res.send(
          "You have registered successfully.Please wait for confirmation from the Admin"
        );
        newSeller, (code = "");
      }
    );
  } else {
    res.send("Code Mismatch.Please enter code again");
  }
});

try {
  router.post("/loginSeller", async (req, res) => {
    let { email, password } = req.body;
    if (email.length <= 0 || password.length <= 0) {
      return res.send("All fields are required");
    }
    conn.query(
      "SELECT email FROM sellers WHERE email=?",
      [email],
      async (err, results) => {
        if (results.length == 0) {
          return res.send(`Incorrect Email or Password`);
        } else {
          conn.query(
            "SELECT * FROM sellers WHERE email=?",
            [email],
            async (err, result) => {
              if (err) throw err;
              if (
                !result ||
                !(await bycrpt.compare(password, result[0].password))
              ) {
                return res.send("Incorrect Email or Password");
              } else {
                conn.query(
                  "SELECT * FROM sellers WHERE email=?",
                  [email],
                  async (err, result) => {
                    if (
                      result &&
                      (await bycrpt.compare(password, result[0].password))
                    ) {
                      conn.query(
                        "SELECT id,username,email,phonenumber,location,category,businessname FROM sellers WHERE email=?",
                        [email],
                        async (err, results) => {
                          if (err) throw err;
                          res.json(results);
                        }
                      );
                    }
                  }
                );
              }
            }
          );
        }
      }
    );
  });
} catch (error) {
  console.log(error);
}
router.get("/getPendingProducts/:id", async (req, res) => {
  conn.query(
    "SELECT id,product,price,images,quantity FROM pending_products WHERE seller_id=?",
    [req.params.id],
    (err, results) => {
      if (err) throw err;
      res.json(results);
    }
  );
});
router.get("/getApprovedProducts/:id", async (req, res) => {
  conn.query(
    "SELECT id,product,price,images,quantity FROM products WHERE seller_id=?",
    [req.params.id],
    (err, results) => {
      if (err) throw err;
      res.json(results);
    }
  );
});
router.get("/items/:id", async (req, res) => {
  conn.query(
    "SELECT * FROM products WHERE seller_id=?",
    [req.params.id],
    (err, results) => {
      if (err) throw err;
      res.json(results.length);
    }
  );
});

router.get("/pending/:id", async (req, res) => {
  conn.query(
    "SELECT * FROM pending_products WHERE seller_id=?",
    [req.params.id],
    (err, results) => {
      if (err) throw err;
      res.json(results.length);
    }
  );
});

router.get("/totalProducts/:id", async (req, res) => {
  conn.query(
    "SELECT * FROM products WHERE seller_id = ? ",
    [req.params.id],
    (err, result) => {
      if (err) {
        throw err;
      } else {
        conn.query(
          "SELECT * FROM pending_products WHERE seller_id=?",
          [req.params.id],
          (error, results) => {
            res.json(result.length + results.length);
          }
        );
      }
    }
  );
});

router.get("/pendingDetails/:id", async (req, res) => {
  conn.query(
    "SELECT * FROM pending_products WHERE id=?",
    [req.params.id],
    (error, results) => {
      if (error) throw error;
      res.send(results);
    }
  );
});

router.get("/pdetails/:id", async (req, res) => {
  conn.query(
    "SELECT * FROM products WHERE id= ?",
    [req.params.id],
    (err, result) => {
      if (err) throw err;
      res.send(result);
    }
  );
});

router.get("/totalProducts/:id", async (req, res) => {
  conn.query(
    "SELECT * FROM products WHERE seller_id = ? ",
    [req.params.id],
    (err, result) => {
      if (err) {
        throw err;
      } else {
        conn.query(
          "SELECT * FROM pending_products WHERE seller_id=?",
          [req.params.id],
          (error, results) => {
            res.json(result.length + results.length);
          }
        );
      }
    }
  );
});

router.get("/totalProducts/:id", async (req, res) => {
  conn.query(
    "SELECT * FROM products WHERE seller_id = ? ",
    [req.params.id],
    (err, result) => {
      if (err) throw err;
      else {
        conn.query(
          "SELECT * FROM pending_products WHERE seller_id=?",
          [req.params.id],
          (error, results) => {
            res.json(result.length + results.length);
          }
        );
      }
    }
  );
});

router.get("/orders/:id", async (req, res) => {
  conn.query(
    `SELECT seller_orders.order_price,seller_orders.order_amount,
  seller_orders.order_product,seller_orders.order_qty,seller_orders.order_discount,
  products.images FROM seller_orders JOIN products ON seller_orders.product_id
  =products.id JOIN sellers ON sellers.id=products.seller_id WHERE sellers.id=?`,
    [req.params.id],
    (err, result) => {
      if (err) throw err;
      res.send(result);
    }
  );
});

router.get("/pendingOrdernumber/:id", (req, res) => {
  conn.query(
    `SELECT*FROM seller_orders JOIN products ON seller_orders.product_id
  =products.id JOIN sellers ON sellers.id=products.seller_id WHERE sellers.id=?`,
    [req.params.id],
    (err, result) => {
      if (err) throw err;
      res.json(result.length);
    }
  );
});

router.get("/doneOrder/:id", (req, res) => {
  conn.query(
    `SELECT cleared_orders.order_price,cleared_orders.order_amount,
  cleared_orders.order_product,cleared_orders.order_qty,cleared_orders.order_discount,
   products.images FROM cleared_orders JOIN products ON cleared_orders.product_id
  =products.id JOIN sellers ON sellers.id=products.seller_id WHERE sellers.id=?`,
    [req.params.id],
    (err, result) => {
      if (err) throw err;
      res.send(result);
    }
  );
});

router.get("/doneOrdernumber/:id", async (req, res) => {
  conn.query(
    `SELECT *FROM cleared_orders JOIN products ON cleared_orders.product_id
  =products.id JOIN sellers ON sellers.id=products.seller_id WHERE sellers.id=?`,
    [req.params.id],
    (err, result) => {
      if (err) throw err;
      res.json(result.length);
    }
  );
});

router.get("/totalOrders/:id", async (req, res) => {
  conn.query(
    `SELECT * FROM cleared_orders JOIN products ON cleared_orders.product_id
  =products.id JOIN sellers ON sellers.id=products.seller_id WHERE sellers.id=?`,
    [req.params.id],
    (err, result) => {
      if (err) throw err;
      conn.query(
        `SELECT * FROM seller_orders JOIN products ON seller_orders.product_id
  =products.id JOIN sellers ON sellers.id=products.seller_id WHERE sellers.id=?`,
        [req.params.id],
        (error, results) => {
          if (error) throw error;
          res.json(result.length + results.length);
        }
      );
    }
  );
});

router.get("/sales/:id", async (req, res) => {
  conn.query(
    `SELECT SUM(order_amount) AS Sales FROM cleared_orders JOIN
  products ON cleared_orders.product_id=products.id JOIN sellers ON sellers.id=
  products.seller_id WHERE sellers.id=?`,
    [req.params.id],
    (err, result) => {
      res.send(result);
    }
  );
});

router.get("/sale/:id", async (req, res) => {
  conn.query(
    `SELECT SUM(order_qty) AS Qty FROM cleared_orders JOIN
  products ON cleared_orders.product_id=products.id JOIN sellers ON sellers.id=
  products.seller_id WHERE sellers.id=?`,
    [req.params.id],
    (err, result) => {
      res.send(result);
    }
  );
});

router.get("/getRejProducts/:id", async (req, res) => {
  conn.query(
    `SELECT rejected_products.id,rejected_products.name,images,
  rejected_products.quantity,rejected_products.reason,rejected_products.price FROM rejected_products JOIN sellers
  ON sellers.id=rejected_products.seller_id WHERE sellers.id=?`,
    [req.params.id],
    (err, result) => {
      if (err) throw err;
      res.send(result);
    }
  );
});

router.get("/subCategory/:id", async (req, res) => {
  conn.query(
    `SELECT category_id FROM category WHERE category_name = ?`,
    [req.params.id.replace(/_/g, " ")],
    (err, result) => {
      if (err) throw err;
      conn.query(
        `SELECT * FROM subCategories WHERE category_id = '${result[0].category_id}'`,
        (error, results) => {
          if (error) throw error;
          res.send(results);
        }
      );
    }
  );
});

module.exports = router;
