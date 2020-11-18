const express = require("express");
const uuid = require("uuid");
const conn = require("../database/db.js");
const bycrpt = require("bcryptjs");

const router = express.Router();

try {
  router.post("/registerSeller", async (req, res) => {
    const {
      username,
      phonenumber,
      location,
      email,
      password,
      passwordConfirm,
      category,
      businessname,
    } = req.body;
    conn.query(
      "SELECT email FROM sellers  WHERE email=?",
      [email],
      async (err, results) => {
        if (err) {
          console.log(err);
        }
        if (results.length > 0) {
          return res.send("Email Already in Use");
        }

        if (password.length < 5) {
          return res.send("Password should be morethan 5 characters");
        }
        if (password != passwordConfirm) {
          return res.send("Password Mismatch");
        }
        let hashedPassword = await bycrpt.hash(password, 1);
        conn.query(
          "INSERT INTO pending_sellers SET ?",
          {
            id: uuid.v4(),
            username: username,
            email: email,
            phonenumber: phonenumber,
            location: location,
            password: hashedPassword,
            businessname:businessname,
            category:category
          },
          (err, results) => {
            if (err) {
              console.log(err);
            } else {
              res.send(
                "Your request has been sent please wait for Confirmation"
              );
            }
          }
        );
      }
    );
  });
} catch (error) {
  console.log(error);
}
try {
  router.post("/loginSeller", async (req, res) => {
    const { email, password } = req.body;
    conn.query(
      "SELECT email FROM sellers WHERE email=?",
      [email],
      async (err, results) => {
        if (results.length == 0) {
          return res.send("User not Found");
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
                        "SELECT id,username,email,phonenumber,location FROM sellers WHERE email=?",
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

router.get("/orders/:id",(req,res)=>{
  conn.query(`SELECT seller_orders.order_price,seller_orders.order_amount,
  seller_orders.order_product,seller_orders.order_qty,seller_orders.order_discount
   FROM seller_orders JOIN products ON seller_orders.product_id
  =products.id JOIN sellers ON sellers.id=products.seller_id WHERE sellers.id=?`,
 [req.params.id],(err,result)=>{
   if(err) throw err;
   res.send(result);
 });
});

router.get("/pendingOrdernumber/:id",(req,res)=>{
  conn.query(`SELECT*FROM seller_orders JOIN products ON seller_orders.product_id
  =products.id JOIN sellers ON sellers.id=products.seller_id WHERE sellers.id=?`,
 [req.params.id],(err,result)=>{
   if(err) throw err;
   res.json(result.length);
 });
});

router.get("/doneOrder/:id",(req,res)=>{
  conn.query(`SELECT cleared_orders.order_price,cleared_orders.order_amount,
  cleared_orders.order_product,cleared_orders.order_qty,cleared_orders.order_discount
   FROM cleared_orders JOIN products ON cleared_orders.product_id
  =products.id JOIN sellers ON sellers.id=products.seller_id WHERE sellers.id=?`,
 [req.params.id],(err,result)=>{
   if(err) throw err;
   res.send(result);
 });
});

router.get("/doneOrdernumber/:id",async(req,res)=>{
  conn.query(`SELECT *FROM cleared_orders JOIN products ON cleared_orders.product_id
  =products.id JOIN sellers ON sellers.id=products.seller_id WHERE sellers.id=?`,
 [req.params.id],(err,result)=>{
   if(err) throw err;
   res.json(result.length);
 });
});

router.get("/totalOrders/:id",async(req,res)=>{
  conn.query(`SELECT * FROM cleared_orders JOIN products ON cleared_orders.product_id
  =products.id JOIN sellers ON sellers.id=products.seller_id WHERE sellers.id=?`,
  [req.params.id],(err,result)=>{
    if(err) throw err;
    conn.query(`SELECT * FROM seller_orders JOIN products ON seller_orders.product_id
  =products.id JOIN sellers ON sellers.id=products.seller_id WHERE sellers.id=?`,
  [req.params.id],(error,results)=>{
    if(error) throw error;
    res.json(result.length+results.length);
  });
  });
});

router.get("/sales/:id" ,async(req,res)=>{
  conn.query(`SELECT SUM(order_amount) AS Sales FROM cleared_orders JOIN
  products ON cleared_orders.product_id=products.id JOIN sellers ON sellers.id=
  products.seller_id WHERE sellers.id=?`,[req.params.id],
  (err,result)=>{
    res.send(result);
  });
});

router.get("/getRejProducts/:id", async(req,res)=>{
  conn.query(`SELECT rejected_products.id,rejected_products.name,images,
  rejected_products.quantity,rejected_products.reason,rejected_products.price FROM rejected_products JOIN sellers
  ON sellers.id=rejected_products.seller_id WHERE sellers.id=?`,[req.params.id],
  (err,result)=>{
    if(err) throw err;
    res.send(result);
  });
});

module.exports = router;
