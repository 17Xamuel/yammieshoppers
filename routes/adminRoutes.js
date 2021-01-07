const express = require("express");
const conn = require("../database/db");
const uuid = require("uuid");

const router = express.Router();

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  let user = [];
  if (email == "yammieshoppers@gmail.com" && password == "yammieshoppers") {
    user = ["Yammie", "0756234512", "Technician", "yammieshoppers@gmail.com"];
    res.send(user);
  } else if (email == "admin@yammieshoppers.com" && password == "admin") {
    user = ["Denis", "0709857117", "Developer", "admin@yammieshoppers.com"];
    res.send(user);
  } else {
    res.send("Incorrect Email or Password");
  }
});

router.get("/customers", async (req, res) => {
  conn.query(`SELECT * FROM customers`, (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});

router.get("/allProducts", async (req, res) => {
  conn.query("SELECT * FROM products", async (error, results) => {
    if (error) throw error;
    res.json(results.length);
  });
});

router.get("/sellerRequests", async (req, res) => {
  conn.query(
    "SELECT id,username,email,phonenumber,location,businessname,category FROM pending_sellers",
    (err, result) => {
      if (err) throw err;
      res.json(result);
    }
  );
});

try {
  router.get("/confirmSeller/:id", async (req, res) => {
    conn.query(
      "SELECT * FROM pending_sellers WHERE id = ? ",
      [req.params.id],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          conn.query("INSERT INTO sellers SET ? ", result, (error, results) => {
            if (error) {
              console.log(error);
            }
            conn.query(
              "DELETE FROM pending_sellers WHERE id = ? ",
              [req.params.id],
              (errs, queryResult) => {
                if (errs) throw errs;
                res.send("Seller Successfully Confirmed");
              }
            );
          });
        }
      }
    );
  });
} catch (qerr) {
  console.log(qerr);
}

try {
  router.get("/deleteSeller/:id", async (req, res) => {
    conn.query(
      "DELETE FROM pending_sellers WHERE id=?",
      [req.params.id],
      (err, results) => {
        if (err) throw err;
        res.send(" Seller Successfully Deleted");
      }
    );
  });
} catch (error) {
  console.log(error);
}

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

router.get("/pendingOrders/:id", async (req, res) => {
  conn.query(
    `SELECT * FROM pending_orders JOIN customers ON 
    customers.c_id=pending_orders.c_id 
    JOIN customer_address ON customers.c_id=customer_address.c_id WHERE order_id=?`,
    [req.params.id],
    (err, results) => {
      if (err) throw err;
      res.json(results);
    }
  );
});

router.get("/sellerInfo/:id", async (req, res) => {
  conn.query(
    `SELECT sellers.id,username,phonenumber,location,email FROM sellers JOIN 
    products ON sellers.id=products.seller_id WHERE products.id=?`,
    [req.params.id],
    (err, result) => {
      if (err) throw err;
      res.send(result);
    }
  );
});

router.get("/orderId/:id", async (req, res) => {
  conn.query(
    "SELECT id FROM seller_orders WHERE product_id=?",
    [req.params.id],
    (err, result) => {
      if (err) throw err;
      res.send(result);
    }
  );
});

router.get("/product/:id", async (req, res) => {
  conn.query(
    "SELECT id FROM seller_orders WHERE product_id=?",
    [req.params.id],
    (err, result) => {
      if (err) throw err;
      res.send(result);
    }
  );
});

router.get("/clearOrder/:id", async (req, res) => {
  conn.query(
    "SELECT * FROM seller_orders WHERE id=?",
    [req.params.id],
    (err, result) => {
      if (err) throw err;
      if (!result) {
        return res.send("Order Already Cleared");
      }
      conn.query(
        "INSERT INTO cleared_orders SET ?",
        result,
        (error, results) => {
          if (error) throw error;
          conn.query(
            "DELETE FROM seller_orders WHERE id=?",
            [req.params.id],
            (errs, queryResult) => {
              if (errs) throw errs;
              res.send("Order Cleared");
            }
          );
        }
      );
    }
  );
});

router.get("/rejected/:id", async (req, res) => {
  conn.query(
    `SELECT product,price,quantity,seller_id FROM pending_products
  WHERE id=?`,
    [req.params.id],
    (err, result) => {
      if (err) throw err;
      res.send(result);
    }
  );
});

router.post("/rejPost/:id", async (req, res) => {
  const { name, price, quantity, reason, seller_id } = req.body;
  conn.query(
    `SELECT images FROM pending_products WHERE id=?`,
    [req.params.id],
    (err, result) => {
      if (err) throw err;
      let image = JSON.stringify(result);
      conn.query(
        `INSERT INTO rejected_products SET ?`,
        {
          id: uuid.v4(),
          name: name,
          price: price,
          quantity: quantity,
          images: image,
          seller_id: seller_id,
          reason: reason,
        },
        (error, results) => {
          if (error) throw error;
          conn.query(
            `DELETE FROM pending_products WHERE id=?`,
            [req.params.id],
            (errs, queryResult) => {
              if (errs) throw errs;
              res.send("Product Rejected");
            }
          );
        }
      );
    }
  );
});

router.get("/getOnlineProducts", async (req, res) => {
  conn.query(`SELECT * FROM products`, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

// router.get("/finishOrder/:id", async (req, res) => {
//   conn.query(
//     `UPDATE pending_orders SET order_status='Finished' WHERE order_id=?`,
//     [req.params.id],
//     (err, result) => {
//       if (err) throw err;
//       res.send("Order Successfully Finished");
//     }
//   );
// });

router.get("/productSeller/:id", async (req, res) => {
  conn.query(
    `SELECT username FROM sellers JOIN products ON products.seller_id=sellers.id WHERE sellers.id = ?`,
    [req.params.id],
    (err, result) => {
      if (err) throw err;
      console.log(result[0]);
      res.send(result[0]);
    }
  );
});

router.post("/addCategory", async (req, res) => {
  let = { catName } = req.body;
  conn.query(
    `INSERT INTO category SET ? `,
    {
      category_name: catName,
    },
    (err, result) => {
      if (err) throw err;
      res.send("Category Added Successfully");
    }
  );
});

router.get("/getCategory", async (req, res) => {
  conn.query("SELECT * FROM category", (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

module.exports = router;
