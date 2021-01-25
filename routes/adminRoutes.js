const express = require("express");
const conn = require("../database/db");
const uuid = require("uuid");
const nodemailer = require("nodemailer");

const router = express.Router();

let transporter = nodemailer.createTransport({
  host: "smtp.domain.com",
  secureConnection: false,
  port: 465,
  auth: {
    user: "info@yammieshoppers.com",
    pass: "yammieShoppers@1"
  }
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (email.length == 0 || password.length == 0) {
    return res.send("All Fields are Required");
  }
  let user = [];
  if (
    email == "yammieshoppers@gmail.com" &&
    password == "yammieshoppersadmin"
  ) {
    user = ["Yammie", "0756234512", "Technician", "yammieshoppers@gmail.com"];
    res.send(user);
  } else if (
    email == "admin@yammieshoppers.com" &&
    password == "administrator"
  ) {
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
    "SELECT id,username,email,phonenumber,location,businessname,category FROM sellers WHERE seller_status='Pending'",
    (err, result) => {
      if (err) throw err;
      res.json(result);
    }
  );
});

try {
  router.get("/confirmSeller/:id", async (req, res) => {
    conn.query(
      `UPDATE sellers SET seller_status = 'Approved' WHERE id=?`,
      [req.params.id],
      async (err, result) => {
        if (err) throw err;
        conn.query(
          `SELECT username,email FROM sellers WHERE id=?`,
          [req.params.id],
          async (error, results) => {
            if (error) throw error;
            let mailOptions = {
              from: '"Yammie Shoppers"<info@yammieshoppers.com>',
              to: results[0].email,
              subject: `Hello ${results[0].username}`,
              text: `Hello, ${results[0].username}  your email ${results[0].email} has 
              been successfully confirmed you can start adding products to the website.`
            };

            transporter.sendMail(mailOptions, (error, response) => {
              if (error) {
                console.log(error);
                return res.send("We are sorry something went wrong.");
              } else {
                res.status(200).send("Seller Successfully Confirmed");
              }
            });
          }
        );
      }
    );
  });
} catch (qerr) {
  console.log(qerr);
}

try {
  router.get("/deleteSeller/:id", async (req, res) => {
    conn.query(
      "DELETE FROM sellers WHERE id=?",
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

router.get("/productDetails/:id", async (req, res) => {
  conn.query(
    `SELECT * FROM products JOIN sellers ON products.seller_id=sellers.id 
    JOIN subCategories ON products.subcategory=subCategories.subcategory_id
    JOIN category ON subCategories.category_id=category.category_id WHERE products.id=?`,
    [req.params.id],
    (err, result) => {
      if (err) throw err;
      if (result.length == 0) {
        conn.query(
          `SELECT * FROM pending_products JOIN sellers ON pending_products.seller_id=sellers.id 
    JOIN subCategories ON pending_products.subcategory=subCategories.subcategory_id
    JOIN category ON subCategories.category_id=category.category_id WHERE pending_products.id=?`,
          [req.params.id],
          (error, results) => {
            if (err) throw err;
            res.send(results);
          }
        );
      } else {
        res.send(result);
      }
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
              res.send("Product Accepted");
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
  conn.query(
    `SELECT * FROM pending_orders WHERE order_status='pending' ORDER BY order_date`,
    (err, results) => {
      if (err) throw err;
      res.json(results);
    }
  );
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
          reason: reason
        },
        (error, results) => {
          if (error) throw error;
          conn.query(
            `DELETE FROM pending_products WHERE id=?`,
            [req.params.id],
            (errs, queryResult) => {
              if (errs) throw errs;
              res.send("Product Rejected Successfully");
            }
          );
        }
      );
    }
  );
});

router.get("/getOnlineProducts", async (req, res) => {
  conn.query(`SELECT * FROM products `, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

router.get("/finishOrder/:id", async (req, res) => {
  conn.query(
    `SELECT * FROM pending_orders WHERE order_id =?`,
    [req.params.id],
    (err1, res1) => {
      if (err1) throw err1;
      let orderItems = Object.values(JSON.parse(res1[0].order_items));
      orderItems.forEach((order) => {
        conn.query(
          `SELECT * FROM cleared_orders WHERE product_id='${order.cartItemAdded}'`,
          (err2, res2) => {
            if (err2) throw err2;
            if (res2.length == 0) {
              conn.query(
                `SELECT * FROM seller_orders WHERE product_id ='${order.cartItemAdded}'`,
                (err3, res3) => {
                  if (err3) throw err3;
                  conn.query(
                    `INSERT INTO cleared_orders SET ?`,
                    res3,
                    (err4, res4) => {
                      if (err4) throw err4;
                      conn.query(
                        `DELETE FROM seller_orders WHERE id='${res3[0].id}'`,
                        (err5, res5) => {
                          if (err5) throw err5;
                        }
                      );
                    }
                  );
                }
              );
            } else if (res2.length > 0) {
              conn.query(
                `SELECT order_qty FROM cleared_orders WHERE product_id='${order.cartItemAdded}'`,
                (err6, res6) => {
                  if (err6) throw err6;
                  let qtyChange =
                    parseInt(res6[0].order_qty) + order.inCartNumber;
                  conn.query(
                    `UPDATE cleared_orders SET order_qty=${qtyChange} WHERE product_id='${order.cartItemAdded}'`,
                    (err7, res7) => {
                      if (err7) throw err7;
                      conn.query(
                        `DELETE  FROM seller_orders WHERE product_id='${order.cartItemAdded}'`,
                        (err10, res10) => {
                          if (err10) throw err10;
                        }
                      );
                    }
                  );
                }
              );
            }
          }
        );
      });
      conn.query(
        `UPDATE pending_orders SET order_status='finished' WHERE order_id=?`,
        [req.params.id],
        (err8, res8) => {
          if (err8) throw err8;
          res.status(200).send("ok");
        }
      );
    }
  );
});

router.get("/getFinishedOrders", async (req, res) => {
  conn.query(
    "SELECT * FROM pending_orders WHERE order_status='finished'",
    (err, result) => {
      if (err) throw err;
      res.send(result);
    }
  );
});

router.post("/addCategory", async (req, res) => {
  let = { catName } = req.body;
  conn.query(
    `INSERT INTO category SET ? `,
    {
      category_name: catName
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

router.post("/addSubCategory", async (req, res) => {
  let { categoryName, subName } = req.body;
  conn.query(
    `SELECT category_id FROM category WHERE category_name=?`,
    [categoryName.replace(/_/g, " ")],
    (err, result) => {
      if (err) throw err;
      conn.query(
        `INSERT INTO subCategories SET ?`,
        {
          category_id: result[0].category_id,
          subCategoryName: subName
        },
        (error, results) => {
          if (error) throw error;
          res.send("SubCategory Added Successfully");
        }
      );
    }
  );
});

router.get("/subCategories", async (req, res) => {
  conn.query(`SELECT * FROM subCategories`, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

router.get("/orderProduct/:id", async (req, res) => {
  conn.query(
    `SELECT price,product,discount FROM products WHERE id = ?`,
    [req.params.id],
    (err, result) => {
      if (err) throw err;
      res.send(result);
    }
  );
});

router.get("/orderSearch/:id", async (req, res) => {
  let pattern = /\W/g;
  let check = pattern.test(req.params.id);
  if (check == true) {
    res.send([]);
    return;
  } else {
    conn.query(
      `SELECT order_id,order_number,order_amount FROM pending_orders WHERE order_number
     LIKE '%${req.params.id}%'`,
      (err, result) => {
        if (err) throw err;
        res.send(result);
      }
    );
  }
});

router.post("/addZone", async (req, res) => {
  let { zoneName, zoneWeight } = req.body;
  conn.query(
    "INSERT INTO zones SET ?",
    {
      zone_name: zoneName,
      zone_weight: zoneWeight
    },
    (err, result) => {
      if (err) throw err;
      res.send("Zone Added Successfully");
    }
  );
});

router.get("/getZone", async (req, res) => {
  conn.query("SELECT * FROM zones", (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

router.post("/addAdresses", async (req, res) => {
  let { zone_name, addressName } = req.body;
  conn.query(
    `SELECT zone_id FROM zones WHERE zone_name = ?`,
    [zone_name.replace(/_/g, " ")],
    (err, result) => {
      if (err) throw err;
      conn.query(
        `INSERT INTO addresses SET ?`,
        {
          zone_id: result[0].zone_id,
          address_name: addressName
        },
        (error, results) => {
          if (error) throw error;
          res.send("Address Added Successfully");
        }
      );
    }
  );
});

router.get("/saleNumber/:id", async (req, res) => {
  conn.query(
    `SELECT SUM(order_qty) AS sales FROM cleared_orders WHERE product_id=?`,
    [req.params.id],
    (error, result) => {
      if (error) throw error;
      res.send(result);
    }
  );
});

router.get("/getAddresses", async (req, res) => {
  conn.query("SELECT * FROM addresses", (err, results) => {
    if (err) throw err;
    res.send(results);
  });
});

router.get("/getAddress/:id", async (req, res) => {
  conn.query(
    `SELECT zone_id FROM zones WHERE zone_name = ?`,
    [req.params.id.replace(/_/g, " ")],
    (err, result) => {
      if (err) throw err;
      conn.query(
        `SELECT * FROM  addresses WHERE zone_id=${result[0].zone_id}`,
        (error, results) => {
          if (err) throw err;
          res.send(results);
        }
      );
    }
  );
});

router.get("/zoneGet/:id", async (req, res) => {
  conn.query(
    `SELECT * FROM zones WHERE zone_name=?`,
    [req.params.id.replace(/_/g, " ")],
    (err, result) => {
      if (err) throw err;
      res.send(result);
    }
  );
});

router.post("/zoneEdit/:id", async (req, res) => {
  let { newName, newWeight } = req.body;
  if (newWeight.length == 0 || newName.length == 0) {
    return res.send("All feilds Required");
  }
  conn.query(
    `UPDATE zones SET zone_name='${newName}',zone_weight='${newWeight}'
  WHERE zone_name = ?`,
    [req.params.id.replace(/_/g, " ")],
    (err, result) => {
      if (err) throw err;
      res.send("Zone Successfully Updated");
    }
  );
});

router.post("/editAddress/:id", async (req, res) => {
  let { newName } = req.body;
  conn.query(
    `UPDATE addresses SET address_name= '${newName}' WHERE address_id=?`,
    [req.params.id],
    (err, result) => {
      if (err) throw err;
      res.send("Address Editted Successfully");
    }
  );
});

router.post("/editCategory/:id", async (req, res) => {
  let { newName } = req.body;

  conn.query(
    `UPDATE category SET category_name='${newName}' WHERE category_name=?`,
    [req.params.id.replace(/_/g, " ")],
    (err, result) => {
      if (err) throw err;
      res.send("Category Edited Successfully");
    }
  );
});

router.post("/editSubCategory/:id", async (req, res) => {
  let { newSubName } = req.body;

  conn.query(
    `UPDATE subCategories SET subCategoryName='${newSubName}' WHERE subCategoryName=?`,
    [req.params.id.replace(/_/g, " ")],
    (err, result) => {
      if (err) throw err;
      res.send("Subcategory Editted Successfully");
    }
  );
});

router.get("/searchProduct/:id", async (req, res) => {
  let patt = /\W/g;
  let myCheck = patt.test(req.params.id);
  if (myCheck == true) {
    res.send([]);
    return;
  } else {
    conn.query(
      `SELECT * FROM products WHERE product LIKE '%${req.params.id}%'`,
      (err, result) => {
        if (err) throw err;
        res.send(result);
      }
    );
  }
});

module.exports = router;
