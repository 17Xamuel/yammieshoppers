const express = require("express");
const conn = require("../database/db");
const uuid = require("uuid");
const nodemailer = require("nodemailer");
const router = express.Router();

//for new user
let newUser = {};
let code = _c(7);
//Generate Code For User
function _c(l) {
  let rc = "1927384560";
  let r = "";
  for (let i = 0; i < l; i++) {
    r += rc.charAt(Math.floor(Math.random() * rc.length));
  }
  return "Y-" + r;
}
//Mailer Config
let transporter = nodemailer.createTransport({
  host: "smtp.domain.com",
  secureConnection: false,
  port: 465,
  auth: {
    user: "info@yammieshoppers.com",
    pass: "Qwerty123",
  },
});

//Code Sent From Here
router.post("sendVerficationCode", async (req, res) => {
  conn.query(
    `SELECT c_email FROM customers WHERE c_email = ?`,
    [req.body.c_email],
    (err, results) => {
      if (err) throw err;
      if (results.length > 0) {
        return res.send("This Email was Used");
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
        newUser = {
          c_id,
          c_email,
          c_gender,
          c_phone,
          c_password,
          c_first_name,
          c_last_name,
        };
        let info = {
          from: '"Yammie Shoppers"<info@yammieshoppers.com>',
          to: c_email,
          subject: "Confirming Your Account",
          text: `Hello ${c_first_name}, confirm your email with this ${code}`,
        };
        transporter
          .sendMail(info)
          .then(function (response) {
            res.send("Verification Code Sent");
          })
          .catch(function (err) {
            res.send("An Error Occured Sending Your Code");
          });
      }
    }
  );
});

// comfirmVerificationCode
router.post("comfirmVerificationCode", (req, res) => {
  if (req.body.fn == code) {
    conn.query("INSERT INTO customers SET ?", newUser, (err) => {
      if (err) {
        return res.status(500).send("Error in Registering");
      } else {
        conn.query(
          "INSERT INTO customer_address SET c_id = ?",
          newUser.c_id,
          (error) => {
            if (error) throw error;
          }
        );
        let id = newUser.c_id;
        code, (newUser = "");
        res.status(200).send(id);
      }
    });
  } else {
    res.send("Invalid Code");
  }
});

//Get All Customers
router.post("/allCustomers", (req, res) => {
  conn.query("SELECT * FROM customers", (err, result) => {});
});

//CustomerslogIn
router.post("/CustomerlogIn", (req, res) => {
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

//Customer Edit Profile
router.post("/customerEditProfile/:id", (req, res) => {
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

//allSellers
router.get("/allSellers", async (req, res) => {
  conn.query("SELECT * FROM sellers", [req.params.id], (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

module.exports = router;
