const express = require("express");
const conn = require("../database/db");
const uuid = require("uuid");
const nodemailer = require("nodemailer");
const router = express.Router();
const charge = require("./charges");

//for new user
let newUser = {};
let code = _c(7);
//code
function _c(l) {
  let rc = "1927384560";
  let r = "";
  for (let i = 0; i < l; i++) {
    r += rc.charAt(Math.floor(Math.random() * rc.length));
  }
  return "Y-" + r;
}
//mailer
let transporter = nodemailer.createTransport({
  host: "smtp.domain.com",
  secureConnection: false,
  port: 465,
  auth: {
    user: "info@yammieshoppers.com",
    pass: "yammieShoppers@1"
  }
});
//mailer
router.post("/customer/insert", async (req, res) => {
  conn.query(
    `SELECT c_email FROM customers WHERE c_email = ?`,
    [req.body.c_email],
    (err, results) => {
      if (err) throw err;
      if (results.length > 0) {
        return res.status(400).send("This Email was Used");
      } else {
        let {
          c_email,
          c_gender,
          c_phone,
          c_password,
          c_first_name,
          c_last_name
        } = req.body;
        let c_id = uuid.v4();
        newUser = {
          c_id,
          c_email,
          c_gender,
          c_phone,
          c_password,
          c_first_name,
          c_last_name
        };
        let info = {
          from: '"Yammie Shoppers"<info@yammieshoppers.com>',
          to: c_email,
          subject: "Confirming Your Account",
          text: `Hello ${c_first_name}, confirm your email with this ${code}`
        };
        transporter
          .sendMail(info)
          .then(function (response) {
            res.status(200).send("ok");
          })
          .catch(function (err) {
            console.log(err);
          });
      }
    }
  );
});
router.post("/customer/confirm", (req, res) => {
  ``;
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
    res.send("nm");
  }
});
router.get("/item/:id", (req, res) => {
  conn.query(
    `SELECT * FROM products WHERE id = ? `,
    [req.params.id],
    (err, result) => {
      if (err) {
        throw err;
      } else {
        res.send(result);
      }
    }
  );
});
router.get("/search/:l-:h", async (req, res) => {
  let query = req.query.q;
  let patt = /\W/g;
  let checkQuery = patt.test(query);
  if (checkQuery == true) {
    res.send([]);
    return;
  } else {
    // this query will be edited later when products increase number
    let _query = "";
    _query =
      query == "foods" ||
      query == "sandals" ||
      query == "electronics" ||
      query == "tshirts" ||
      query == "shoes" ||
      query == "phoneaccessories" ||
      query == "phones" ||
      query == "music" ||
      query == "drinks" ||
      query == "utensils" ||
      query == "diy" ||
      query == "stationery" ||
      query == "laptopaccessories" ||
      query == "computers" ||
      query == "allproducts" ||
      query == "all" ||
      query == "recentlyviewed" ||
      query == "recommendedforyou" ||
      query == "gascookers" ||
      query == "trending"
        ? "SELECT * FROM products"
        : `SELECT * FROM products 
          WHERE product LIKE '%${query}%' 
            OR brand LIKE '%${query}%'
            OR description LIKE '%${query}%'`;
    conn.query(_query, (err, result) => {
      if (err) {
        throw err;
      } else {
        if (req.params.l == "min") {
          res.send(result);
        } else {
          if (parseInt(req.params.h) > 1) {
            let newResult = result
              .filter((item) => item.price >= parseInt(req.params.l))
              .filter((item) => item.price <= parseInt(req.params.h));
            if (newResult.length == 0) {
              res.send([]);
            } else {
              res.send(newResult);
            }
          } else {
            let newResult = result
              .filter((item) => item.discount >= parseFloat(req.params.l) * 100)
              .filter(
                (item) => item.discount <= parseFloat(req.params.h) * 100
              );
            console.log(req.params.l, req.params.h);
            if (newResult.length == 0) {
              res.send([]);
            } else {
              console.log(newResult);
              res.send(newResult);
            }
          }
        }
      }
    });
  }
});
//LogIn Api
router.post("/customer/lg", (req, res) => {
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

router.get("/customer/:id", (req, res) => {
  conn.query(
    "SELECT * FROM customers WHERE c_id = ?",
    [req.params.id],
    (err, result) => {
      if (err) throw err;
      res.send(result);
    }
  );
});
router.post("/customer/cart/amount/:id", (req, res) => {
  conn.query(
    "UPDATE customers SET c_cart_amount = ? where c_id = ?",
    req.body,
    (err, result) => {
      if (err) throw err;
      res.status(200).send("cart amount upated");
    }
  );
});
router.get("/customer/cart/amount/:id", (req, res) => {
  conn.query(
    "SELECT c_cart_amount FROM customers WHERE c_id = ?",
    [req.params.id],
    (err, result) => {
      if (err) throw err;
      res.status(200).send(result);
    }
  );
});

// new order
function rs(l) {
  var rc = "abcdefgh14";
  var r = "";
  for (var i = 0; i < l; i++) {
    r += rc.charAt(Math.floor(Math.random() * rc.length));
  }
  let date = new Date();
  return (
    (date.getDate() < 10
      ? "0" + date.getDate().toString()
      : date.getDate().toString()) +
    (date.getMonth() + 1).toString() +
    r
  );
}
router.post("/customer/order", async (req, res) => {
  let orderNumber = rs(5);
  conn.query(
    `SELECT * FROM customer_address 
        JOIN customers ON customers.c_id=customer_address.c_id
          WHERE customer_address.c_id = ? `,
    req.body.yammie,
    (err, result) => {
      if (err) {
        throw err;
      } else {
        conn.query(
          "INSERT INTO pending_orders SET ? ",
          {
            order_id: uuid.v4(),
            order_items: req.body.order,
            order_amount: req.body._ttp,
            order_payment_method: req.body.payment_method,
            c_id: req.body.yammie,
            order_status: req.body.u == "-u" ? "urgent" : "normal",
            order_number: orderNumber,
            order_date: new Date(),
            order_info: JSON.stringify({
              shipping: req.body._shp,
              address:
                req.body.add == "undefined"
                  ? result[0].pickup_address_1
                  : req.body.add,
              order_delivery_method: req.body.dm
            })
          },
          (err, result_1) => {
            if (err) throw err;
            let items = JSON.parse(req.body.order);
            let itemdetails = Object.values(items);
            itemdetails.forEach((item) => {
              conn.query(
                `SELECT * FROM products WHERE id= '${item.cartItemAdded}'`,
                (qerr, qresult) => {
                  if (qerr) throw qerr;
                  if (qresult.length > 0) {
                    conn.query(
                      `SELECT quantity FROM products WHERE id='${item.cartItemAdded}'`,
                      (errq, resultq) => {
                        if (errq) throw errq;
                        let quantityChange = resultq[0] - item.incartNumber;
                        conn.query(
                          `UPDATE products SET quantity =${quantityChange} WHERE id='${item.cartItemAdded}'`,
                          (q_err, q_result) => {
                            if (q_err) throw q_err;
                            conn.query(
                              `SELECT * FROM seller_orders WHERE product_id='${item.cartItemAdded}'`,
                              (errr, result_0) => {
                                if (errr) throw errr;
                                if (result_0.length == 0) {
                                  conn.query(
                                    `INSERT INTO seller_orders SET ?`,
                                    {
                                      id: uuid.v4(),
                                      product_id: item.cartItemAdded,
                                      order_price: item.price,
                                      order_product: item.name,
                                      order_discount: item.discount,
                                      order_qty: item.inCartNumber,
                                      order_amount:
                                        (item.price -
                                          (item.discount / 100) * item.price) *
                                        item.inCartNumber
                                    },
                                    (error, result_3) => {
                                      if (error) throw error;
                                    }
                                  );
                                } else if (result_0.length > 0) {
                                  conn.query(
                                    `SELECT order_qty FROM seller_orders WHERE product_id='${item.cartItemAdded}'`,
                                    (err_0, res_0) => {
                                      if (err_0) throw err_0;
                                      let finalQuantity =
                                        res_0[0].order_qty + item.inCartNumber;
                                      conn.query(
                                        `UPDATE seller_orders SET order_qty =${finalQuantity} WHERE product_id='${item.cartItemAdded}'`,
                                        (err_1, res_1) => {
                                          if (err_1) throw err_1;
                                        }
                                      );
                                    }
                                  );
                                }
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

            let info = {
              from: '"Yammie Shoppers"<info@yammieshoppers.com>',
              to: result[0].c_email,
              subject: "Order Placement",
              text: `Hello ${result[0].c_first_name},
                      your order has been placed successfully and your
                      order number is ${orderNumber}`
            };
            transporter
              .sendMail(info)
              .then(function (response) {
                res.status(200).send(req.body.payment_method);
              })
              .catch(function (err) {
                console.log("Error Ocurred!!!");
              });
          }
        );
      }
    }
  );
});
//trending category items
// route-->/category/category(name)/nature(trending, headsets,..etc)
function category(ct, nature, res) {
  conn.query(`SELECT * FROM products`, (err, result) => {
    if (err) {
      throw err;
    } else {
      res.send(result);
    }
  });
}
router.get("/ct/:ct/:nature", (req, res) => {
  category(req.params.ct, req.params.nature, res);
});
router.post("/customer/edit/:id", (req, res) => {
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
router.get("/account/address/:id", (req, res) => {
  conn.query(
    `SELECT * FROM customer_address
      JOIN customers
      ON customer_address.c_id = customers.c_id
        WHERE customer_address.c_id = ? `,
    req.params.id,
    (err, result) => {
      if (err) throw err;
      res.status(200).send(result);
    }
  );
});
router.post("/account/address/edit/:id", (req, res) => {
  conn.query(
    `SELECT * FROM customer_address WHERE c_id = ?`,
    [req.params.id],
    (err, result) => {
      if (err) throw err;
      let newAddress = {};
      if (result.length == 0) {
        newAddress.c_id = req.params.id;
        newAddress.pickup_address_1 = req.body.add;
        newAddress.zone = req.body.zone;
        conn.query(
          `INSERT INTO customer_address SET ? `,
          newAddress,
          (error, results) => {
            if (error) throw "err: " + error;
            res.send("Changed");
          }
        );
      } else {
        newAddress.pickup_address_1 = req.body.add;
        newAddress.zone = req.body.zone;
        conn.query(
          `UPDATE customer_address SET ? WHERE c_id = ?`,
          [newAddress, req.params.id],
          (error, results) => {
            if (error) throw error;
            res.send("Changed");
          }
        );
      }
    }
  );
});

router.post("/shipping/:id", (req, res) => {
  let { price, qty, size, weight, fragile, location, urgent } = req.body;
  conn.query(
    `SELECT zone FROM customer_address WHERE c_id = ?`,
    [req.params.id],
    (err, result) => {
      if (err) throw err;
      let product = {
        user: result[0].zone,
        price,
        qty,
        size,
        weight,
        fragile,
        location,
        urgent
      };

      let cost = new charge(product).total;
      let _price = new charge(product).price;
      res.send({ shipping: cost, totalPrice: _price });
    }
  );
});
router.post("/customer/cart/:id", (req, res) => {
  conn.query(
    `SELECT c_cart,c_cart_number FROM customers WHERE c_id = ?`,
    req.params.id,
    (err, result_0) => {
      if (err) {
        throw err;
      } else {
        let result = result_0[0];
        let cart = JSON.parse(result.c_cart);
        let newCart = {};
        let cart_number = 0;
        if (cart != null) {
          for (let key in cart) {
            newCart[key] = cart[key];
          }
          for (let item in req.body.cart) {
            if (newCart[item] == req.body.cart[item]) {
              newCart[item].inCartNumber += 1;
            } else {
              newCart[item] = req.body.cart[item];
            }
          }

          for (let key in newCart) {
            cart_number += newCart[key].inCartNumber;
          }
          conn.query(
            `UPDATE customers SET ? WHERE c_id = ?`,
            [
              { c_cart: JSON.stringify(newCart), c_cart_number: cart_number },
              req.params.id,
            ],
            (error, result_2) => {
              if (error) {
                throw error;
              } else {
                return res
                  .status(200)
                  .send({ newCart: newCart, cart_number: cart_number });
              }
            }
          );
        } else {
          conn.query(
            `UPDATE customers SET ? WHERE c_id = ?`,
            [
              {
                c_cart: JSON.stringify(req.body.cart),
                c_cart_number: req.body.cartNumber,
              },
              req.params.id,
            ],
            (error, result_2) => {
              if (error) {
                throw error;
              } else {
                res.status(200).send({
                  newCart: req.body.cart,
                  cart_number: req.body.cartNumber,
                });
              }
            }
          );
        }
      }
    }
  );
});
module.exports = router;
