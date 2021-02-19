const express = require("express");
const multer = require("multer");
const uuid = require("uuid");
const conn = require("./database/db.js");
const aws = require("aws-sdk");
const multerS3 = require("multer-s3");
const PORT = process.env.PORT || 8000;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/api/admin/", require("./routes/adminRoutes"));
app.use("/api/user/", require("./routes/userRoutes"));
app.use("/api/app/", require("./routes/appRoutes"));
app.use("/api/sellers/", require("./routes/sellerRoutes"));
app.use("/api/products/", require("./routes/products"));
app.use("/api/orders/", require("./routes/orders"));
app.use("/api/users/", require("./routes/users"));

app.use(express.static("public", { extensions: ["html", "htm"] }));

//spaces for image files

// Set S3 endpoint to DigitalOcean Spaces
const spacesEndpoint = new aws.Endpoint("nyc3.digitaloceanspaces.com");
const s3 = new aws.S3({
  endpoint: spacesEndpoint,
  accessKeyId: "47H74K3ZGEGOYZS5ERRL",
  secretAccessKey: "eoNqWeUucKi5VA7kNzTE5F3jg6jHvJhcpowKpu9rngE"
});

function getUpload(id) {
  let upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: "yammie",
      acl: "public-read",
      key: function (request, file, cb) {
        cb(null, id + "-" + file.originalname);
      }
    })
  }).array("images");
  return upload;
}
//upload_other_files
function getUploadFile(id) {
  let upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: "yammieuploads",
      acl: "public-read",
      key: function (request, file, cb) {
        cb(null, id + "-" + file.originalname);
      }
    })
  }).array("images");
  return upload;
}

function _deleteFile(i) {
  var params = {
    Bucket: "yammie",
    Key: i
  };
  s3.deleteObject(params, function (err, data) {
    if (err) console.log(err, err.stack);
    else return true;
  });
}

function _deleteUploadFile(i) {
  var params = {
    Bucket: "yammieuploads",
    Key: i
  };
  s3.deleteObject(params, function (err, data) {
    if (err) console.log(err, err.stack);
    else return true;
  });
}
//spaces for image files

app.post("/addProduct", async (req, res) => {
  let productId = uuid.v4();
  let upload = getUpload(productId);
  upload(req, res, (err) => {
    if (err) throw err;
    let imagePaths = [];
    req.files.forEach((file) => {
      imagePaths.push("https://yammie.nyc3.digitaloceanspaces.com/" + file.key);
    });
    let path = JSON.stringify(imagePaths);
    const {
      product,
      price,
      description,
      subcategory,
      discount,
      seller_id,
      quantity,
      detailedDescription,
      brand,
      color,
      weight,
      fragility,
      dimensions,
      size,
      typeOfProduct,
      netWeight,
      mySize,
      mydiscount,
      myprice,
      ingridient,
      ingridientPrice,
      ingridientdiscount,
      flavor
    } = req.body;
    if (color !== undefined) {
      var colors = [];
      if (typeof color == "string") {
        colors.push(color.replace(/ /g, "_"));
        console.log(colors);
      } else {
        color.forEach((col) => {
          colors.push(col.replace(/ /g, "_"));
        });
      }
    }

    if (flavor !== undefined) {
      var flavors = [];
      if (typeof flavor == "string") {
        flavors.push(flavor.replace(/ /g, "_"));
      } else {
        flavor.forEach((flav) => {
          flavors.push(flav.replace(/ /g, "_"));
        });
      }
    }

    if (mySize !== undefined) {
      var sizes = [];
      if (typeof mySize == "string") {
        sizes.push(mySize.replace(/ /g, "_"));
      } else {
        mySize.forEach((size) => {
          sizes.push(size.replace(/ /g, "_"));
        });
      }
    }

    if (myprice !== undefined) {
      var sizePrices = [];
      if (typeof myprice == "string") {
        sizePrices.push(parseInt(myprice));
      } else {
        myprice.forEach((sizePrice) => {
          sizePrices.push(parseInt(sizePrice));
        });
      }
    }

    if (mydiscount !== undefined) {
      var sizeDiscounts = [];
      if (typeof mydiscount == "string") {
        sizeDiscounts.push(parseInt(mydiscount));
      } else {
        mydiscount.forEach((sizeDiscount) => {
          sizeDiscounts.push(parseInt(sizeDiscount));
        });
      }
    } else {
      sizeDiscounts = [0];
    }

    if (ingridient !== undefined) {
      var ingridients = [];
      if (typeof ingridient == "string") {
        ingridients.push(ingridient.replace(/ /g, "_"));
      } else {
        ingridient.forEach((ing) => {
          ingridients.push(ing.replace(/ /g, "_"));
        });
      }
    }

    if (ingridientPrice !== undefined) {
      var ingridientPrices = [];
      if (typeof ingridientPrice == "string") {
        ingridientPrices.push(parseInt(ingridientPrice));
      } else {
        ingridientPrice.forEach((ingPrice) => {
          ingridientPrices.push(parseInt(ingPrice));
        });
      }
    }

    if (ingridientdiscount !== undefined) {
      var ingridientdiscounts = [];
      if (typeof ingridientdiscount == "string") {
        ingridientdiscounts.push(parseInt(ingridientdiscount));
      } else {
        ingridientdiscount.forEach((ingDis) => {
          ingridientdiscounts.push(parseInt(ingDis));
        });
      }
    } else {
      ingridientdiscounts = [0];
    }

    function getVariations(mydescription, pricing, discounting) {
      if (
        mydescription !== undefined &&
        pricing !== undefined &&
        discounting !== undefined
      ) {
        let myVariations = [];
        for (let j = 0; j < mydescription.length; j++) {
          myVariations.push({
            descriptions: mydescription[j],
            getPrice: pricing[j],
            getDiscount: discounting[j]
          });
        }
        return myVariations;
      } else {
        return undefined;
      }
    }

    conn.query(
      `SELECT subcategory_id,category_id FROM subCategories WHERE 
      subCategoryName = '${subcategory}'`,
      (error, result) => {
        if (error) throw err;
        conn.query(
          "INSERT INTO pending_products SET ? ",
          {
            id: productId,
            product: product,
            price: price,
            quantity: quantity,
            description: description,
            category: result[0].category_id,
            subcategory: result[0].subcategory_id,
            discount: parseInt(discount) || 0,
            images: path,
            seller_id: seller_id,
            detailedDescription,
            specifications: JSON.stringify({
              date: Date.now(),
              Brand: brand || null,
              Color: colors || null,
              Weight: weight,
              Fragile: fragility,
              Dimensions: dimensions || null,
              Size: size,
              TypeOfProduct: typeOfProduct,
              NetWeight: netWeight || null,
              Flavor: flavors || null,
              Sizes: getVariations(sizes, sizePrices, sizeDiscounts) || null,
              Ingredients:
                getVariations(
                  ingridients,
                  ingridientPrices,
                  ingridientdiscounts
                ) || null
            })
          },
          (err, results) => {
            if (err) {
              console.log(err);
            } else {
              res.redirect("./seller/product");
            }
          }
        );
      }
    );
  });
});

app.post("/editImages", async (req, res) => {
  let upload = getUpload(uuid.v4());
  upload(req, res, (err) => {
    if (err) throw err;
    let _images = [];
    req.files.forEach((file) => {
      _images.push("https://yammie.nyc3.digitaloceanspaces.com/" + file.key);
    });
    let _str = JSON.stringify(_images);
    conn.query(
      `SELECT * FROM products WHERE id=?`,
      [req.body.id],
      (err1, res1) => {
        if (err1) throw err1;
        let images = JSON.parse(res1[0].images);
        images.forEach((image) => {
          _deleteFile(image.slice(43, image.length));
        });
        conn.query(
          `UPDATE products SET images='${_str}' WHERE id=?`,
          [req.body.id],
          (err2, res2) => {
            if (err2) throw err2;
            res.redirect("./admin/products");
          }
        );
      }
    );
  });
});

app.delete("/deleteProduct/:id", async (req, res) => {
  conn.query(
    `SELECT * FROM pending_products WHERE id=?`,
    [req.params.id],
    (err1, res1) => {
      if (err1) throw err1;
      if (res1.length > 0) {
        let images = JSON.parse(res1[0].images);
        images.forEach((image) => {
          _deleteFile(image.slice(43, image.length));
        });
        conn.query(
          `DELETE FROM pending_products WHERE  id= ?`,
          [req.params.id],
          (err2, res2) => {
            if (err2) throw err2;
            res.send("OK");
          }
        );
      } else {
        conn.query(
          `SELECT * FROM products WHERE id=?`,
          [req.params.id],
          (err3, res3) => {
            if (err3) throw err3;
            let _images = JSON.parse(res3[0].images);
            _images.forEach((file) => {
              _deleteFile(file.slice(43, file.length));
              console.log("Image");
            });
            conn.query(
              `DELETE FROM products WHERE id=?`,
              [req.params.id],
              (err4, res4) => {
                if (err4) throw err4;
                res.send("OK");
              }
            );
          }
        );
      }
    }
  );
});

app.post("/editProduct", async (req, res) => {
  let {
    id,
    product,
    price,
    description,
    discount,
    seller_id,
    quantity,
    detailedDescription
  } = req.body;

  conn.query(
    `SELECT * FROM pending_products WHERE id=?`,
    [id],
    (err1, res1) => {
      if (err1) throw err1;
      if (res1.length > 0) {
        conn.query(`INSERT INTO products SET?`, res1, (err2, res2) => {
          if (err2) throw err2;
          conn.query(
            `DELETE FROM pending_prodcts WHERE id=?`,
            [id],
            (err3, res3) => {
              if (err3) throw err3;
              res.redirect("./admin/products");
            }
          );
        });
      } else if (res1.length == 0) {
        conn.query(
          `UPDATE products SET ? WHERE id=?`,
          [
            {
              product: product,
              discount: parseInt(discount),
              quantity: quantity,
              detailedDescription: detailedDescription,
              description: description,
              seller_id: seller_id,
              price: price
            },
            id
          ],
          (err1, res1) => {
            if (err1) throw err1;
            res.redirect("./admin/products");
          }
        );
      }
    }
  );
});

app.post("/addImages", async (req, res) => {
  let imageId = uuid.v4();
  let uploading = getUploadFile(imageId);
  uploading(req, res, (err) => {
    if (err) throw err;
    let images = [];
    req.files.forEach((file) => {
      images.push(
        "https://yammieuploads.nyc3.digitaloceanspaces.com/" + file.key
      );
    });
    let pathing = JSON.stringify(images);
    let { Uploads } = req.body;
    conn.query(
      `SELECT * FROM appImages WHERE destination='${Uploads}'`,
      (err, result) => {
        if (err) throw err;
        if (result.length == 0) {
          conn.query(
            `INSERT INTO appImages SET ?`,
            {
              image_id: imageId,
              image_path: pathing,
              destination: Uploads
            },
            (error, results) => {
              if (error) throw error;
              res.redirect("./admin/upload");
            }
          );
        } else {
          let images = JSON.parse(result[0].image_path);
          images.forEach((image) => {
            _deleteUploadFile(image.slice(50, image.length));
          });
          conn.query(
            `UDATE appImages SET image='${pathing}' WHERE destination='${Uploads}'`,
            (err1, res1) => {
              if (err1) throw err1;
              res.redirect("./admin/uploads");
            }
          );
        }
      }
    );
  });
});

app.post("/addSubCategory", async (req, res) => {
  let imageId = uuid.v4();
  let upload = getUploadFile(imageId);
  upload(req, res, (err) => {
    if (err) throw err;
    let image = [];
    req.files.forEach((file) => {
      image.push(
        "http://yammieuploads.nyc3.digitaloceanspaces.com/" + file.key
      );
    });
    let path = JSON.stringify(image);
    let { category, subcategory } = req.body;
    conn.query(
      `SELECT * FROM category WHERE category_name=?`,
      [category.replace(/_/g, " ")],
      (err1, res1) => {
        if (err1) throw err1;
        conn.query(
          `INSERT INTO subCategories SET ? `,
          {
            subCategoryName: subcategory,
            category_id: res1[0].category_id,
            image: path
          },
          (err2, res2) => {
            if (err2) throw err2;
            res.redirect("./admin/categories");
          }
        );
      }
    );
  });
});

app.post("/editSubcategoryImage", async (req, res) => {
  let upload = getUploadFile(uuid.v4());
  upload(req, res, (err) => {
    if (err) throw err;
    let _image = [];
    req.files.forEach((file) => {
      _image.push(
        "https://yammieuploads.nyc3.digitaloceanspaces.com/" + file.key
      );
    });
    let { sub } = req.body;
    conn.query(
      `SELECT image FROM subCategories WHERE subCategoryName = ? `,
      [sub.replace(/_/g, " ")],
      (error, result) => {
        if (error) throw error;
        if (result.length > 0) {
          let images = JSON.parse(result[0].image);
          images.forEach((image) => {
            _deleteUploadFile(image.slice(50, image.length));
          });
          let path = JSON.stringify(_image);
          conn.query(
            `UPDATE subCategories SET image='${path}' WHERE subCategoryName = ?`,
            [sub.replace(/_/g, " ")],
            (err, results) => {
              if (err) throw err;
              res.redirect("./admin/categories");
            }
          );
        }
      }
    );
  });
});

app.use(function (req, res, next) {
  res.status(404);
  res.redirect("/404");
});

app.listen(PORT, () => {
  console.log(`Server started on ${PORT}...`);
});
