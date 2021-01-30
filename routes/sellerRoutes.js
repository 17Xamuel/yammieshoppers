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
  let seller_status = "Pending";

  if (
    username.length == 0 ||
    email.length == 0 ||
    phonenumber.length == 0 ||
    password.length == 0 ||
    passwordConfirm.length == 0 ||
    businessname.length == 0 ||
    category.length == 0 ||
    location.length == 0
  ) {
    return res.send("All Fields are Required");
  }
  conn.query(
    `SELECT email FROM sellers WHERE email=?`,
    [email],
    (err, result) => {
      if (err) throw err;
      if (result.length > 0) {
        return res.send("Email Already in Use");
      }
    }
  );
  if (password.length < 5) {
    return res.send("Password must be more than 5 characters");
  } else if (password != passwordConfirm) {
    return res.send("Password Mismatch");
  }

  let id = uuid.v4();
  password = await bycrpt.hash(password, 2);
  category = JSON.stringify(category);
  newSeller = {
    id,
    username,
    email,
    phonenumber,
    businessname,
    location,
    category,
    password,
    seller_status
  };

  let mailOptions = {
    from: '"Yammie Shoppers"<info@yammieshoppers.com>',
    to: email,
    subject: `Email Confirmation ${code}`,
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
    conn.query("INSERT INTO sellers SET ? ", newSeller, (err, result) => {
      if (err) {
        console.log(err);
        return res.send("An error ocurred!!!");
      }
      res.send(
        "You have registered successfully.Please wait for confirmation from the Admin"
      );

      let mailing = {
        from: '"Yammie Shoppers" <info@yammieshoppers.com',
        to: "theyammieinc@gmail.com",
        subject: `New Seller ${code}`,
        text:
          "Hello Admin, yammieshoppers has received a new seller waiting for confirmation. Thanks"
      };

      transporter.sendMail(mailing, (error, results) => {
        if (error) throw error;
      });
      newSeller, (code = "");
    });
  } else {
    res.send("Code Mismatch.Please enter code again");
  }
});

router.post("/loginSeller", async (req, res) => {
  let { email, password } = req.body;
  if (email.length == 0 || password.length == 0) {
    return res.send("All fields are required");
  }
  conn.query(
    `SELECT * FROM sellers WHERE email=?`,
    [email],
    async (err1, res1) => {
      if (err1) throw err1;
      if (res1.length == 0) {
        return res.send("Incorrect Email or Password");
      } else if (res1.length > 0) {
        if (res1[0].seller_status == "Pending") {
          return res.send("Wait for Admin Approval to Login");
        } else if (res1[0].seller_status == "Approved") {
          if (!res1 || !(await bycrpt.compare(password, res1[0].password))) {
            return res.send("Incorrect Email or Password");
          } else if (
            res1 &&
            (await bycrpt.compare(password, res1[0].password))
          ) {
            res.send(res1);
          }
        }
      }
    }
  );
});

router.get("/getPendingProducts/:id", async (req, res) => {
  conn.query(
    "SELECT * FROM pending_products WHERE seller_id=?",
    [req.params.id],
    (err, results) => {
      if (err) throw err;
      res.json(results);
    }
  );
});

router.get("/getApprovedProducts/:id", async (req, res) => {
  conn.query(
    "SELECT * FROM products WHERE seller_id=?",
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
        console.log(err);
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

router.post("/forgotPassword", async (req, res) => {
  let { email, password, newPass } = req.body;
  if (email.length == 0 || password.length == 0 || newPass.length == 0) {
    return res.send("All fields Required");
  }
  conn.query(
    `SELECT * FROM sellers WHERE email = ?`,
    [email],
    async (err1, res1) => {
      if (err1) throw err1;
      if (res1.length == 0) {
        return res.send("This user is not Found!! Check your Email");
      }
      if (password != newPass) {
        return res.send("Password Mismatch");
      }
      if (password.length < 5) {
        return res.send("Password Must be more than 5 characters");
      }
      let hashPass = await bycrpt.hash(password, 2);
      conn.query(
        `UPDATE sellers SET password = '${hashPass}' WHERE email = ?`,
        [email],
        (err2, res2) => {
          if (err2) throw err2;
          res.send("Password Successfully Changed");
        }
      );
    }
  );
});

module.exports = router;
