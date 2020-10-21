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
    } = req.body;
    conn.query(
      "SELECT email FROM pending_sellers WHERE email=?",
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
          },
          (err, results) => {
            if (err) {
              console.log(err);
            } else {
              res.send("Registered Successfully");
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

router.get("/pending/:id",async(req,res)=>{
  conn.query("SELECT * FROM pending_products WHERE seller_id=?",[req.params.id],(err,results)=>{
    if(err)throw err;
    res.json(results.length);
  });
});

router.get("/totalProducts/:id",async(req,res)=>{
  conn.query("SELECT * FROM products WHERE seller_id = ? ",
  [req.params.id],
  (err,result)=>{
    if(err){
     throw err;
    }else {
      conn.query("SELECT * FROM pending_products WHERE seller_id=?",
      [req.params.id],
      (error,results)=>{
         res.json(result.length + results.length)
      });
    }
    
  });
});

router.get("/pendingDetails/:id", async (req,res)=>{
  conn.query("SELECT product,price,discount,quantity,description FROM pending_products WHERE id=?",
  [req.params.id],(error,results)=>{
    if(error) throw error;
    res.send(results);
  });
});

router.get("/pdetails/:id",async (req,res)=>{
  conn.query("SELECT product,price,discount,quantity,description FROM products WHERE id= ?",
  [req.params.id],(err,result)=>{
    if(err) throw err;
    res.send(result);
  });
});

module.exports = router;
