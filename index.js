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
app.use("/api/api/", require("./routes/appRoutes"));
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

// Change bucket property to your Space name
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
      netWeight
    } = req.body;
    conn.query(
      `SELECT subcategory_id FROM subCategories WHERE subCategoryName = '${subcategory}'`,
      (error, result) => {
        if (error) throw err;
        conn.query(
          "INSERT INTO pending_products SET ? ",
          {
            id: productId,
            product: product,
            price: price,
            description: description,
            subcategory: result[0].subcategory_id,
            discount: discount,
            images: path,
            seller_id: seller_id,
            quantity: quantity,
            detailedDescription,
            specifications: JSON.stringify({
              Brand: brand || null,
              Color: color || null,
              Weight: weight,
              Fragile: fragility,
              Dimensions: dimensions || null,
              Size: size,
              TypeOfProduct: typeOfProduct,
              NetWeight: netWeight || null
            })
          },
          (err, results) => {
            if (err) {
              console.log(err);
            } else {
              res.redirect("./seller/product.html");
            }
          }
        );
      }
    );
  });
});

app.delete("/deleteProduct/:id", async (req, res) => {
  conn.query(
    "SELECT images from pending_products WHERE id = ? ",
    [req.params.id],
    (err, results) => {
      if (err) throw "Error" + err;
      conn.query(
        "DELETE FROM pending_products WHERE id = ? ",
        [req.params.id],
        async (err, results) => {
          if (err) throw err;
          res.send("Deleted");
        }
      );
    }
  );
});

app.post("/editAndConfirm", async (req, res) => {
  let {
    id,
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
    netWeight
  } = req.body;

  conn.query(
    `SELECT images FROM pending_products WHERE id=?`,
    [id],
    async (err, result) => {
      if (err) throw err;
      conn.query(
        `INSERT INTO products SET ?`,
        {
          id: id,
          product: product,
          price: price,
          description: description,
          subcategory: subcategory,
          discount: discount,
          images: JSON.stringify(result[0].images),
          seller_id: seller_id,
          quantity: quantity,
          detailedDescription,
          specifications: JSON.stringify({
            Brand: brand || null,
            Color: color || null,
            Weight: weight,
            Fragile: fragility,
            Dimensions: dimensions || null,
            Size: size,
            TypeOfProduct: typeOfProduct,
            NetWeight: netWeight || null
          })
        },
        (error, results) => {
          if (error) throw error;
          conn.query(
            `DELETE FROM pending_products WHERE id=?`,
            [id],
            (err1, res1) => {
              if (err1) throw err1;
              res.redirect("./admin/products.html");
            }
          );
        }
      );
    }
  );
});

app.post("/addImages", async (req, res) => {
  let imageId = uuid.v4();
  let uploading = getUpload(imageId);
  uploading(req, res, (err) => {
    if (err) throw err;
    let images = [];
    req.files.forEach((file) => {
      images.push("https://yammie.nyc3.ondigitaloceanspaces.com/" + file.key);
    });
    let pathing = JSON.stringify(images);
    let { Uploads } = req.body;
    conn.query(
      `INSERT INTO appImages SET ?`,
      {
        image_id: imageId,
        image_path: pathing,
        destination: Uploads
      },
      (error, results) => {
        if (error) throw error;
        res.redirect("./admin/upload.html");
      }
    );
  });
});

app.post("/edit", async (req, res) => {
  let {
    id,
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
    netWeight
  } = req.body;

  let newSpecification = JSON.stringify({
    Brand: brand || null,
    Color: color || null,
    Weight: weight,
    Fragile: fragility,
    Dimensions: dimensions || null,
    Size: size,
    TypeOfProduct: typeOfProduct,
    NetWeight: netWeight || null
  });

  conn.query(
    `UPDATE products SET product='${product}', price=${price},description='${description}',
        subcategory=${subcategory},discount=${discount},seller_id='${seller_id}',quantity=${quantity}, 
        detailedDescription='${detailedDescription}',specifications='${newSpecification}' WHERE id=?`,
    [id],
    (err1, res1) => {
      if (err1) throw err1;
      res.redirect("./admin/products.html");
    }
  );
});

app.post("/addSubcategoryImage", async (req, res) => {
  let upload = getUpload(uuid.v4());
  upload(req, res, (err) => {
    if (err) throw err;
    let image = [];
    req.files.forEach((file) => {
      image.push("https://yammie.nyc3.ondigitaloceanspaces.com/" + file.key);
    });
    let path = JSON.stringify(image);
    let { subCategoryName } = req.body;
    conn.query(
      `UPDATE subCategories SET image='${path}' WHERE subCategoryName = ?`,
      [subCategoryName.replace(/_/g, " ")],
      (err, results) => {
        if (err) throw err;
        res.redirect("./admin/products.html");
      }
    );
  });
});

app.listen(PORT, () => {
  console.log(`Server started on ${PORT}...`);
});
