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
    pass: "yammieShoppers@1",
  },
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
    user = ["Samuel", "0756234512", "Technician", "yammieshoppers@gmail.com"];
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

router.get("/allSellers", async (req, res) => {
  conn.query(
    "SELECT * FROM sellers WHERE seller_status='Approved'",
    async (error, results) => {
      if (error) throw error;
      res.send(results);
    }
  );
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

router.get("/seller/:id", async (req, res) => {
  conn.query(
    `SELECT id,username,email,phonenumber,location,businessname,category FROM sellers WHERE id=?`,
    [req.params.id],
    (err, result) => {
      if (err) throw err;
      res.send(result);
    }
  );
});

router.get("/searchSeller/:id", async (req, res) => {
  let _patt = /\W/g;
  let ch = _patt.test(req.params.id);
  if (ch === true) {
    res.send([]);
    return;
  } else {
    conn.query(
      `SELECT * FROM sellers WHERE username LIKE '%${req.params.id}%'`,
      (err, result) => {
        if (err) throw err;
        res.send(result);
      }
    );
  }
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
              text: `Hello, ${results[0].username}  your email ${results[0].email} has been successfully confirmed you can start adding products to the website.
              https://www.yammieshoppers.com/seller/addProduct`,
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

router.get("/faqs", async (req, res) => {
  conn.query(`SELECT * FROM faqs`, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
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
          reason: reason,
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

router.post("/finishOrder/:id", async (req, res) => {
  conn.query(
    `SELECT * FROM pending_orders WHERE order_id=?`,
    [req.params.id],
    (err1, res1) => {
      if (err1) throw err1;
      let total = 0;

      let newInfo = JSON.parse(res1[0].order_info);

      _info = JSON.stringify({
        shipping: newInfo.shipping,
        order_urgent: newInfo.order_urgent,
        address: newInfo.address,
        order_delivery_method: newInfo.order_delivery_method,
        admin: req.body.name,
        date: new Date(),
      });

      let items = Object.values(JSON.parse(res1[0].order_items));
      items.forEach((item) => {
        conn.query(
          `SELECT * FROM seller_orders WHERE product_id='${item.cartItemAdded}' AND 
         order_status='Approved'`,
          (err2, res2) => {
            if (err2) throw err2;
            if (res2.length == 0) {
              conn.query(
                `SELECT * FROM seller_orders WHERE product_id='${item.cartItemAdded}'
              AND order_status='Pending'`,
                (err_9, res_9) => {
                  if (err_9) throw err_9;
                  if (res_9[0].specification !== null) {
                    let _cart = 0;
                    res_9.forEach((result) => {
                      _cart += result.order_qty;
                      let spec = JSON.parse(result.specification);
                      if (
                        (spec.Sizes === null || spec.Sizes === undefined) &&
                        (spec.Ingredients === null ||
                          spec.Ingredients === undefined)
                      ) {
                        total += 0;
                      } else if (
                        (spec.Sizes === null || spec.Sizes === undefined) &&
                        (spec.Ingredients !== null ||
                          spec.Ingredients !== undefined)
                      ) {
                        for (let i = 0; i < spec.Ingredients.length; i++) {
                          total += spec.Ingredients[i].price;
                        }
                      } else if (
                        (spec.Sizes !== null || spec.Sizes !== undefined) &&
                        (spec.Ingredients === undefined ||
                          spec.Ingredients === null)
                      ) {
                        for (let [key, value] of Object.entries(spec.Sizes)) {
                          total += parseInt(`${value}`);
                        }
                      } else if (
                        (spec.Sizes !== null || spec.Sizes !== undefined) &&
                        (spec.Ingredients !== null ||
                          spec.Ingredients !== undefined)
                      ) {
                        for (let [key, value] of Object.entries(spec.Sizes)) {
                          total += parseInt(`${value}`);
                        }
                        for (let i = 0; i < spec.Ingredients.length; i++) {
                          total += spec.Ingredients[i].price;
                        }
                      }
                    });
                    conn.query(
                      `INSERT INTO seller_orders SET?`,
                      {
                        id: uuid.v4(),
                        product_id: `${item.cartItemAdded}`,
                        order_qty: `${_cart}`,
                        order_product: `${res_9[0].order_product}`,
                        order_amount: `${null}`,
                        order_status: "Approved",
                        order_price: `${res_9[0].order_price}`,
                        order_discount: `${res_9[0].order_discount}`,
                        variation: `${total}`,
                      },
                      (merr, mres) => {
                        if (merr) throw merr;
                        conn.query(
                          `DELETE FROM seller_orders WHERE product_id='${item.cartItemAdded}'
                        AND order_status='Pending'`,
                          (_merr, _mres) => {
                            if (_merr) throw _merr;
                          }
                        );
                      }
                    );
                  } else {
                    conn.query(
                      `UPDATE seller_orders SET order_status='Approved' WHERE product_id='${item.cartItemAdded}'
               AND order_status='Pending'`,
                      (err3, res3) => {
                        if (err3) throw err3;
                      }
                    );
                  }
                }
              );
            } else {
              conn.query(
                `SELECT * FROM seller_orders WHERE product_id='${item.cartItemAdded}'
               AND order_status='Pending'`,
                (err6, res6) => {
                  if (err6) throw err6;
                  if (res6.length == 0) {
                    conn.query(
                      `UPDATE seller_orders SET order_status='Approved' WHERE product_id=
                    '${item.cartItemAdded}'`,
                      (querr, qures) => {
                        if (querr) throw querr;
                      }
                    );
                  } else {
                    let mqty = parseInt(res2[0].order_qty);
                    if (res6[0].specification === null) {
                      let qty = parseInt(res6[0].order_qty) - item.inCartNumber;
                      if (qty == 0) {
                        let update =
                          item.inCartNumber + parseInt(res2[0].order_qty);
                        conn.query(
                          `UPDATE seller_orders SET order_qty=${update} WHERE product_id =
                        '${item.cartItemAdded}'`,
                          (err7, res7) => {
                            if (err7) throw err7;
                            conn.query(
                              `DELETE FROM seller_orders WHERE product_id='${item.cartItemAdded}'
                          AND order_status='Pending'`,
                              (err8, res8) => {
                                if (err8) throw err8;
                              }
                            );
                          }
                        );
                      } else {
                        let _update =
                          item.inCartNumber + parseInt(res2[0].order_qty);
                        conn.query(
                          `UPDATE seller_orders SET order_qty=${_update} WHERE product_id = 
                        '${item.cartItemAdded}' AND order_status='Approved'`,
                          (err9, res9) => {
                            if (err9) throw err9;
                          }
                        );
                      }
                    } else {
                      res6.forEach((result) => {
                        mqty += parseInt(result.order_qty);
                        let spec = JSON.parse(result.specification);
                        if (
                          (spec.Sizes === null || spec.Sizes === undefined) &&
                          (spec.Ingredients === null ||
                            spec.Ingredients === undefined)
                        ) {
                          total += parseInt(result.order_amount);
                        } else if (
                          (spec.Sizes === null || spec.Sizes === undefined) &&
                          (spec.Ingredients !== null ||
                            spec.Ingredients !== undefined)
                        ) {
                          for (let i = 0; i < spec.Ingredients.length; i++) {
                            total += spec.Ingredients[i].price;
                          }
                        } else if (
                          (spec.Sizes !== null || spec.Sizes !== undefined) &&
                          (spec.Ingredients === undefined ||
                            spec.Ingredients === null)
                        ) {
                          for (let [key, value] of Object.entries(spec.Sizes)) {
                            total += parseInt(`${value}`);
                          }
                        } else if (
                          (spec.Sizes !== null || spec.Sizes !== undefined) &&
                          (spec.Ingredients !== null ||
                            spec.Ingredients !== undefined)
                        ) {
                          for (let [key, value] of Object.entries(spec.Sizes)) {
                            total += parseInt(`${value}`);
                          }
                          for (let i = 0; i < spec.Ingredients.length; i++) {
                            total += spec.Ingredients[i].price;
                          }
                        }
                      });
                      let _total = total + parseInt(res2[0].variation);
                      conn.query(
                        `UPDATE seller_orders SET order_qty=${mqty},order_amount=${null},variation=${_total} WHERE
                    product_id='${
                      item.cartItemAdded
                    }' AND order_status='Approved'`,
                        (err0, res0) => {
                          if (err0) throw err0;
                          conn.query(
                            `DELETE FROM seller_orders WHERE product_id='${item.cartItemAdded}'
                        AND order_status='Pending'`,
                            (err, result) => {
                              if (err) throw err;
                            }
                          );
                        }
                      );
                    }
                  }
                }
              );
            }
          }
        );
      });
      conn.query(
        `UPDATE pending_orders SET order_info='${_info}',order_status='finished' WHERE
      order_id=?`,
        [req.params.id],
        (error, results) => {
          if (error) throw error;
          conn.query(
            `SELECT c_email,c_last_name FROM  customers WHERE c_id='${res1[0].c_id}'`,
            (errs, qres) => {
              if (errs) throw errs;
              let _email = {
                from: '"Yammie Shoppers" <info@yammieshoppers.com>',
                to: `${qres[0].c_email}`,
                subject: `Finish Order ${res1[0].order_number}`,
                text: `Hello ${qres[0].c_last_name}, your order ${res1[0].order_number} has been successfully finished.Thanks for Shopping with Yammie Shoppers.`,
              };
              transporter.sendMail(_email, (mailErr, response) => {
                if (mailErr) throw mailErr;
                res.status(200).send("ok");
              });
            }
          );
        }
      );
    }
  );
});

router.post("/cancelOrder/:id", async (req, res) => {
  conn.query(
    `SELECT * FROM pending_orders WHERE order_id=?`,
    [req.params.id],
    (err1, res1) => {
      if (err1) throw err1;

      let total = 0;

      let newInfo = JSON.parse(res1[0].order_info);

      _info = JSON.stringify({
        shipping: newInfo.shipping,
        order_urgent: newInfo.order_urgent,
        address: newInfo.address,
        order_delivery_method: newInfo.order_delivery_method,
        admin: req.body.name,
        date: new Date(),
      });

      let items = Object.values(JSON.parse(res1[0].order_items));
      items.forEach((item) => {
        conn.query(
          `SELECT * FROM seller_orders WHERE product_id='${item.cartItemAdded}' AND 
        order_status='Pending'`,
          (err2, res2) => {
            if (err2) throw err2;
            if (res2.length > 0) {
              if (res2[0].specification === null) {
                let qty = parseInt(res2[0].order_qty) - item.inCartNumber;
                if (qty == 0) {
                  conn.query(
                    `SELECT quantity FROM products WHERE id='${item.cartItemAdded}'`,
                    (err3, res3) => {
                      if (err3) throw err3;
                      let _qty = parseInt(res3[0].quantity) + item.inCartNumber;
                      conn.query(
                        `UPDATE products SET quantity =${_qty} WHERE id='${item.cartItemAdded}'`,
                        (err4, res4) => {
                          if (err4) throw err4;
                          conn.query(
                            `DELETE FROM seller_orders WHERE product_id='${item.cartItemAdded}'`,
                            (err5, res5) => {
                              if (err5) throw err5;
                            }
                          );
                        }
                      );
                    }
                  );
                } else {
                  conn.query(
                    `SELECT quantity FROM products WHERE id='${item.cartItemAdded}'`,
                    (err6, res6) => {
                      if (err6) throw err6;
                      let qty_ = parseInt(res6[0].quantity) + item.inCartNumber;
                      conn.query(
                        `UPDATE products SET quantity =${qty_} WHERE id='${item.cartItemAdded}'`,
                        (err7, res7) => {
                          if (err7) throw err7;
                          conn.query(
                            `UPDATE seller_orders SET order_qty=${qty} WHERE product_id=
                          '${item.cartItemAdded}'`,
                            (error, results) => {
                              if (error) throw error;
                            }
                          );
                        }
                      );
                    }
                  );
                }
              } else {
                let mqty = 0;
                res2.forEach((result) => {
                  mqty += parseInt(res2[0].order_qty);
                });
                conn.query(
                  `DELETE FROM seller_orders WHERE product_id='${item.cartItemAdded}' AND
                order_status='Pending'`,
                  (err8, res8) => {
                    if (err8) throw err8;
                    conn.query(
                      `SELECT quantity FROM products WHERE id='${item.cartItemAdded}'`,
                      (err9, res9) => {
                        if (err9) throw err9;
                        let myqty = parseInt(res9[0].quantity) + mqty;
                        conn.query(
                          `UPDATE products SET quantity=${myqty} WHERE id='${item.cartItemAdded}'`,
                          (err0, res0) => {
                            if (err0) throw err0;
                          }
                        );
                      }
                    );
                  }
                );
              }
            } else {
              let spec = item.specs;

              if (
                (spec.Sizes === null || spec.Sizes === undefined) &&
                (spec.Ingredients === null || spec.Ingredients === undefined)
              ) {
                total += 0;
              } else if (
                (spec.Sizes === null || spec.Sizes === undefined) &&
                (spec.Ingredients !== null || spec.Ingredients !== undefined)
              ) {
                for (let i = 0; i < spec.Ingredients.length; i++) {
                  total += spec.Ingredients[i].price;
                }
              } else if (
                (spec.Sizes !== null || spec.Sizes !== undefined) &&
                (spec.Ingredients === undefined || spec.Ingredients === null)
              ) {
                for (let [key, value] of Object.entries(spec.Sizes)) {
                  total += parseInt(`${value}`);
                }
              } else if (
                (spec.Sizes !== null || spec.Sizes !== undefined) &&
                (spec.Ingredients !== null || spec.Ingredients !== undefined)
              ) {
                for (let [key, value] of Object.entries(spec.Sizes)) {
                  total += parseInt(`${value}`);
                }
                for (let i = 0; i < spec.Ingredients.length; i++) {
                  total += spec.Ingredients[i].price;
                }
              }

              conn.query(
                `SELECT * FROM seller_orders WHERE product_id='${item.cartItemAdded}'`,
                (err_0, res_0) => {
                  if (err_0) throw err_0;
                  let amountChange = res_0[0].variation - total;
                  let qty_m = parseInt(res_0[0].order_qty) - item.inCartNumber;
                  if (qty_m == 0) {
                    conn.query(
                      `SELECT quantity FROM products   WHERE id='${item.cartItemAdded}'`,
                      (err_1, res_1) => {
                        if (err_1) throw err_1;
                        let pqty = parseInt(res_1[0].quantity) + cart;
                        conn.query(
                          `UPDATE products SET quantity=${pqty} WHERE id='${item.cartItemAdded}'`,
                          (err_2, res_2) => {
                            if (err_2) throw err_2;
                            conn.query(
                              `DELETE FROM seller_orders WHERE product_id='${item.cartItemAdded}'`,
                              (err_3, res_3) => {
                                if (err_3) throw err_3;
                              }
                            );
                          }
                        );
                      }
                    );
                  } else if (qty_m > 0) {
                    conn.query(
                      `UPDATE seller_orders SET order_amount=${amountChange},order_qty=${qty_m}
                     WHERE product_id='${item.cartItemAdded}'`,
                      (err_4, res_4) => {
                        if (err_4) throw err_4;
                        conn.query(
                          `SELECT quantity FROM products WHERE id='${item.cartItemAdded}'`,
                          (err_5, res_5) => {
                            if (err_5) throw err_5;
                            let tqty =
                              parseInt(res_5[0].quantity) + item.inCartNumber;
                            conn.query(
                              `UPDATE products SET quantity=${tqty} WHERE id='${item.cartItemAdded}'`,
                              (err_6, res_6) => {
                                if (err_6) throw err_6;
                              }
                            );
                          }
                        );
                      }
                    );
                  }
                }
              );
            }
          }
        );
      });
      conn.query(
        `UPDATE pending_orders SET order_info='${_info}',order_status='cancelled' WHERE order_id=?`,
        [req.params.id],
        (_err, _res) => {
          if (_err) throw _err;
          conn.query(
            `SELECT c_email,c_last_name FROM customers WHERE c_id='${res1[0].c_id}'`,
            (qerr, qres) => {
              if (qerr) throw qerr;
              let cancelMail = {
                from: '"Yammie Shoppers" <info@yammieshoppers.com>',
                to: `${qres[0].c_email}`,
                subject: `Cancel Order ${res1[0].order_number}`,
                text: `Hello ${qres[0].c_last_name}, your order has been cancelled because ${req.body.reason} but thanks for shopping with Yammie Shoppers`,
              };
              transporter.sendMail(cancelMail, (merr, result_0) => {
                if (merr) throw "Error" + merr;
                res.status(200).send("ok");
              });
            }
          );
        }
      );
    }
  );
});

router.get("/getFinishedOrders", async (req, res) => {
  conn.query(
    "SELECT * FROM pending_orders WHERE order_status='finished' OR order_status='cancelled'",
    (err, result) => {
      if (err) throw err;
      res.send(result);
    }
  );
});

router.post("/addQuestion", async (req, res) => {
  let { qns, ans } = req.body;
  conn.query(`SELECT * FROM faqs  WHERE question =?`, [qns], (err, result) => {
    if (err) throw err;
    if (result.length > 0) {
      return res.send("Question Already Exists");
    } else {
      conn.query(
        `INSERT INTO faqs SET ?`,
        {
          faqId: uuid.v4(),
          question: qns,
          answer: ans,
        },
        (error, results) => {
          if (error) throw error;
          res.send("ok");
        }
      );
    }
  });
});

router.post("/addCategory", async (req, res) => {
  let { catName } = req.body;
  conn.query(
    `SELECT * FROM category WHERE category_name=?`,
    [catName],
    (error, results) => {
      if (error) throw error;
      if (results.length > 0) {
        return res.send("Category Already Exists");
      } else {
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
      }
    }
  );
});

router.get("/getCategory", async (req, res) => {
  conn.query("SELECT * FROM category", (err, result) => {
    if (err) throw err;
    res.send(result);
  });
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
     LIKE '%${req.params.id}%' AND order_status='pending'`,
      (err, result) => {
        if (err) throw err;
        res.send(result);
      }
    );
  }
});

router.get("/processedOrder/:id", async (req, res) => {
  let pattern = /\W/g;
  let check = pattern.test(req.params.id);
  if (check == true) {
    res.send([]);
    return;
  } else {
    conn.query(
      `SELECT order_id,order_number,order_amount FROM pending_orders WHERE order_number
     LIKE '%${req.params.id}%' AND order_status='finished' OR order_status='cancelled'`,
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
    `SELECT * FROM zones WHERE zone_name=?`,
    [zoneName],
    (err1, res1) => {
      if (err1) throw err1;
      if (res1.length > 0) {
        return res.send("Zone Already Exits");
      } else {
        conn.query(
          "INSERT INTO zones SET ?",
          {
            zone_name: zoneName,
            zone_weight: zoneWeight,
          },
          (err, result) => {
            if (err) throw err;
            res.send("Zone Added Successfully");
          }
        );
      }
    }
  );
});

router.get("/mzone/:id", async (req, res) => {
  let pattern = /\W/g;
  let check = pattern.test(req.params.id);
  if (check === true) {
    res.send([]);
    return;
  } else {
    conn.query(
      `SELECT * FROM zones WHERE zone_name LIKE '%${req.params.id}%'`,
      (err, result) => {
        if (err) throw err;
        res.send(result);
      }
    );
  }
});

router.get("/searchCategory/:id", async (req, res) => {
  let pattern = /\W/g;
  let check = pattern.test(req.params.id);
  if (check === true) {
    res.send([]);
    return;
  } else {
    conn.query(
      `SELECT * FROM category WHERE category_name LIKE '%${req.params.id}%'`,
      (err, result) => {
        if (err) throw err;
        res.send(result);
      }
    );
  }
});

router.get("/searchSub/:id", async (req, res) => {
  let pattern = /\W/g;
  let check = pattern.test(req.params.id);
  if (check === true) {
    res.send([]);
    return;
  } else {
    conn.query(
      `SELECT * FROM subCategories WHERE subCategoryName LIKE '%${req.params.id}%'`,
      (err, result) => {
        if (err) throw err;
        res.send(result);
      }
    );
  }
});

router.get("/maddress/:id", async (req, res) => {
  let pattern = /\W/g;
  let check = pattern.test(req.params.id);
  if (check === true) {
    res.send([]);
    return;
  } else {
    conn.query(
      `SELECT * FROM addresses WHERE address_name LIKE '%${req.params.id}%'`,
      (err, result) => {
        if (err) throw err;
        res.send(result);
      }
    );
  }
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
    `SELECT * FROM addresses WHERE address_name=?`,
    [addressName],
    (err1, res1) => {
      if (err1) throw err1;
      if (res1.length > 0) {
        return res.send("Address Already Exists");
      } else {
        conn.query(
          `SELECT zone_id FROM zones WHERE zone_name = ?`,
          [zone_name.replace(/_/g, " ")],
          (err, result) => {
            if (err) throw err;
            conn.query(
              `INSERT INTO addresses SET ?`,
              {
                zone_id: result[0].zone_id,
                address_name: addressName,
              },
              (error, results) => {
                if (error) throw error;
                res.send("Address Added Successfully");
              }
            );
          }
        );
      }
    }
  );
});

router.get("/myAddresses/:id", async (req, res) => {
  conn.query(
    `SELECT address_name FROM addresses WHERE zone_id=?`,
    [req.params.id],
    (err, result) => {
      if (err) throw err;
      res.send(result);
    }
  );
});

router.get("/_zone/:id", async (req, res) => {
  conn.query(
    `SELECT zone_name FROM zones WHERE zone_id = ?`,
    [req.params.id],
    (err, result) => {
      if (err) throw err;
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
    `UPDATE zones SET ? WHERE
   zone_name = ?`,
    [
      {
        zone_name: newName,
        zone_weight: newWeight,
      },
      req.params.id.replace(/_/g, " "),
    ],
    (err, result) => {
      if (err) throw err;
      res.send("Zone Successfully Updated");
    }
  );
});

router.post("/editAddress/:id", async (req, res) => {
  let { newName } = req.body;
  conn.query(
    `UPDATE addresses SET ? WHERE address_id=?`,
    [
      {
        address_name: newName,
      },
      req.params.id,
    ],
    (err, result) => {
      if (err) throw err;
      res.send("Address Editted Successfully");
    }
  );
});

router.post("/editCategory/:id", async (req, res) => {
  let { newName } = req.body;

  conn.query(
    `UPDATE category SET ? WHERE category_name=?`,
    [
      {
        category_name: newName,
      },
      req.params.id.replace(/_/g, " "),
    ],
    (err, result) => {
      if (err) throw err;
      res.send("Category Edited Successfully");
    }
  );
});

router.get("/getCat/:id", async (req, res) => {
  conn.query(
    `SELECT category_name FROM category WHERE category_id=?`,
    [req.params.id],
    (err, result) => {
      if (err) throw err;
      res.send(result);
    }
  );
});

router.post("/editSubCategory/:id", async (req, res) => {
  let { newSubName } = req.body;

  conn.query(
    `UPDATE subCategories SET? WHERE subCategoryName=?`,
    [
      {
        subCategoryName: newSubName,
      },
      req.params.id.replace(/_/g, " "),
    ],
    (err, result) => {
      if (err) throw err;
      res.send("Subcategory Editted Successfully");
    }
  );
});

router.post("/editMyCategory/:id", async (req, res) => {
  let { category_name, subCategoryName } = req.body;
  conn.query(
    `SELECT category_id FROM category WHERE category_name='${category_name.replace(
      /_/g,
      " "
    )}'`,
    (err1, res1) => {
      if (err1) throw err1;
      conn.query(
        `SELECT subcategory_id FROM subCategories WHERE subCategoryName='${subCategoryName.replace(
          /_/g,
          " "
        )}'`,
        (err2, res2) => {
          if (err2) throw err2;
          conn.query(
            `UPDATE products SET subcategory=${res2[0].subcategory_id},
            category=${res1[0].category_id} WHERE id=?`,
            [req.params.id],
            (err, result) => {
              if (err) throw err;
              res.send("Category Editted Successfully");
            }
          );
        }
      );
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

router.get("/getSpecifications/:id", async (req, res) => {
  conn.query(
    `SELECT specifications FROM pending_products WHERE id=?`,
    [req.params.id],
    (err, result) => {
      if (err) throw err;
      if (result.length == 0) {
        conn.query(
          `SELECT specifications FROM products WHERE id=?`,
          [req.params.id],
          (error, results) => {
            if (error) throw error;
            res.send(results);
          }
        );
      } else {
        res.send(result);
      }
    }
  );
});

router.post("/editSpecifications/:id", async (req, res) => {
  let {
    newBrand,
    newSize,
    newWeight,
    NetWeight,
    typeOfProduct,
    Fragile,
    Dimensions,
    color,
    flavor,
    sizes,
    ingridients,
  } = req.body;

  let newSpecifications = JSON.stringify({
    date: Date.now(),
    Brand: newBrand,
    Color: color || null,
    Weight: newWeight,
    Fragile: Fragile,
    Dimensions: Dimensions || null,
    Size: newSize,
    TypeOfProduct: typeOfProduct,
    NetWeight: NetWeight || null,
    TypeOfProduct: typeOfProduct,
    Flavor: flavor || null,
    Sizes: sizes || null,
    Ingredients: ingridients || null,
  });

  conn.query(
    `SELECT * FROM pending_products WHERE id=?`,
    [req.params.id],
    (err, result) => {
      if (err) throw err;
      if (result.length > 0) {
        conn.query(
          `UPDATE pending_products SET specifications='${newSpecifications}' WHERE id=?`,
          [req.params.id],
          (err1, res1) => {
            if (err1) throw err1;
            res.send("OK");
          }
        );
      } else if (result.length == 0) {
        conn.query(
          `UPDATE products SET specifications='${newSpecifications}' WHERE id=?`,
          [req.params.id],
          (err1, res1) => {
            if (err1) throw err1;
            res.send("OK");
          }
        );
      }
    }
  );
});

router.get("/saleNumber/:id", async (req, res) => {
  conn.query(
    `SELECT SUM(order_qty) AS sales FROM seller_orders WHERE product_id=? AND order_status='Approved'`,
    [req.params.id],
    (error, result) => {
      if (error) throw error;
      res.send(result);
    }
  );
});

router.get("/income", async (req, res) => {
  conn.query(
    `SELECT order_info FROM pending_orders WHERE order_status='finished'`,
    (err, results) => {
      if (err) throw err;
      let total = 0;
      results.forEach((result) => {
        let income = JSON.parse(result.order_info);
        total += parseInt(income.shipping);
      });
      res.json(total);
    }
  );
});

router.get("/trending", async (req, res) => {
  conn.query(
    `SELECT images,product,price FROM products JOIN seller_orders   ON 
    products.id=seller_orders.product_id WHERE order_qty >= 10 AND order_status='Approved'`,
    (err1, res1) => {
      if (err1) throw err1;
      res.send(res1);
    }
  );
});

router.get("/medium", async (req, res) => {
  conn.query(
    `SELECT images,product,price FROM products JOIN seller_orders   ON 
    products.id=seller_orders.product_id WHERE order_qty BETWEEN 5 AND 9 AND order_status='Approved'`,
    (err1, res1) => {
      if (err1) throw err1;
      res.send(res1);
    }
  );
});

router.get("/least", async (req, res) => {
  conn.query(
    `SELECT images,product,price FROM products JOIN seller_orders   ON 
    products.id=seller_orders.product_id WHERE order_qty < 5 AND order_status='Approved'`,
    (err1, res1) => {
      if (err1) throw err1;
      res.send(res1);
    }
  );
});

module.exports = router;
