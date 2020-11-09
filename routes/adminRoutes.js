const express = require("express");
const conn = require("../database/db");
const uuid=require("uuid");

const router = express.Router();

router.post("/login",(req,res)=>{
  const {email,password}=req.body;
  let user=[];
    if(email=="sam@mail.com" && password=="sam256"){
       user=["Samuel","0756234512","Technician","sam@mail.com"];
       res.send(user);
    }else{
      res.send("User Not Found");
    }
});

router.get("/customers", async (req, res) => {
  conn.query(`SELECT * FROM customers`, (err, result) => {
    if (err) throw err;
    res.json(result.length);
  });
});

router.get("/allProducts", async (req,res)=>{
  conn.query("SELECT * FROM products", async (error,results)=>{
    if(error) throw error;
        res.json(results.length);
      });
});

router.get("/sellerRequests", async (req, res) => {
  conn.query(
    "SELECT id,username,email,phonenumber,location FROM pending_sellers",
    (err, result) => {
      if (err) throw err;
      res.json(result);
    }
  );
});

router.get("/confirmSeller/:id", async (req, res) => {
  conn.query(
    "SELECT *FROM pending_sellers WHERE id=?",
    [req.params.id],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        conn.query("INSERT INTO sellers SET ? ", result, (error, results) => {
          if (error) throw error;
          conn.query(
            "DELETE FROM pending_sellers WHERE id = ? ",
            [req.params.id],
            (errs, queryResult) => {
              if (errs) throw errs;
              res.send("Confirmed");
            }
          );
        });
      }
    }
  );
});

router.get("/deleteSeller/:id", async (req, res) => {
  conn.query(
    "DELETE FROM pending_sellers WHERE id=?",
    [req.params.id],
    (err, results) => {
      if (err) throw err;
      res.send(" Product Deleted");
    }
  );
});


router.get("/pendingProduct", async (req, res) => {
  conn.query(
    "SELECT id,product,price,images,description FROM pending_products",
    (err, result) => {
      if (err) throw err;
      res.json(result);
    }
  );
});

router.get("/pendingProduct/:id", async (req, res) => {
  conn.query(
    "SELECT * FROM pending_products JOIN sellers ON pending_products.seller_id=sellers.id WHERE pending_products.id=?",
    [req.params.id],
    (err, result) => {
      if (err) throw err;
      res.json(result);
    }
  );
});

router.get("/confirmProduct/:id", async (req, res) => {
  conn.query(
    "SELECT * FROM pending_products WHERE id = ? ",
    [req.params.id],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        conn.query("INSERT INTO products SET ? ", result, (error, results) => {
          console.log(error);
          if (error) throw err;
          conn.query(
            "DELETE FROM pending_products WHERE id = ? ",
            [req.params.id],
            (errs, queryResult) => {
              if (errs) throw errs;
              res.send(" Product Accepted");
            }
          );
        });
      }
    }
  );
});



router.get("/orderNumber", async (req, res) => {
  conn.query(`SELECT * FROM pending_orders`, (err, result) => {
    if (err) throw err;
    res.json(result.length);
  });
});

router.get("/pendingOrders", async (req, res) => {
  conn.query(`SELECT * FROM pending_orders`, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});
router.get("/pendingOrders/:id", async (req,res) =>{
  conn.query(`SELECT * FROM pending_orders JOIN customers ON customers.c_id=pending_orders.c_id WHERE order_id=?`,[req.params.id], (err,results) =>{
    if(err) throw err;
    res.json(results);
  });
});

router.get("/sellerInfo/:id",async(req,res)=>{
  conn.query("SELECT sellers.id,username,phonenumber,location,email FROM sellers JOIN products ON sellers.id=products.seller_id WHERE products.id=?",
  [req.params.id],(err,result)=>{
    if(err) throw err;
    res.send(result);
  });
});

router.post("/notifyOrder",async (req,res)=>{
  const {id,qty,product,price,amount,discount}=req.body;
  conn.query(`INSERT INTO seller_orders SET ?`,{
    id:uuid.v4(),
    product_id:id,
    order_price:price,
    order_product:product,
    order_qty:qty,
    order_discount:discount,
    order_amount:amount,
  },(err,result)=>{
    if(err) throw err;
    res.send("Seller Notified");
  });
});

router.get("/orderId/:id",async(req,res)=>{
  conn.query("SELECT id FROM seller_orders WHERE product_id=?",[req.params.id],
  (err,result)=>{
    if(err) throw err;
    res.send(result);
  });
});

router.get("/product/:id",async(req,res)=>{
  conn.query("SELECT id FROM seller_orders WHERE product_id=?",[req.params.id],
  (err,result)=>{
    if(err) throw err;
    res.send(result);
  });
});

router.get("/clearOrder/:id",async(req,res)=>{
  conn.query("SELECT * FROM seller_orders WHERE id=?",[req.params.id],
  (err,result)=>{
    if(err) throw err;
    conn.query("INSERT INTO cleared_orders SET ?",result,(error,results)=>{
      if(error) throw error;
      conn.query("DELETE FROM seller_orders WHERE id=?",[req.params.id],
      (errs,queryResult)=>{
        if(errs) throw errs;
        res.send("Order Cleared");
      });
    });
  });
});



module.exports = router;
