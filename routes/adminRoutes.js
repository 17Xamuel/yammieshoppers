const express = require("express");
const conn = require("../database/db");

const router = express.Router();

//Customer Routes
router.get("/customers", async (req, res) => {
  conn.query(`SELECT * FROM customers`, (err, result) => {
    if (err) throw err;
    res.json(result.length);
  });
});

//End Customer Routes

//Seller Routes
router.get("/allProducts", async (req,res)=>{
  conn.query("SELECT * FROM pending_products", (err,result)=>{
    if(err){
      console.log(err);
    }else {
      conn.query("SELECT * FROM products", async (error,results)=>{
        res.json(result.length+results.length);
      });
    }
  });
});

router.get("/sellers", async (req, res) => {
  conn.query(`SELECT * FROM sellers`, (err, result) => {
    if (err) throw err;
    res.json(result.length);
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
//End Seller Routes

//Item Routes

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
    "SELECT product,price,images,description,quantity,discount,brand FROM pending_products WHERE id=?",
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
  conn.query(`SELECT * FROM pending_orders WHERE order_id = ? `,[req.params.id], (err,results) =>{
    if(err) throw err;
    res.json(results);
  });
});

//End Item Routes

module.exports = router;
