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
      },
    }),
  }).array("images");
  return upload;
}

//spaces for image files

// function getStorage(id) {
//   const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//       cb(null, "/uploads/images/products/");
//     },
//     filename: (req, file, cb) => {
//       cb(null, id + "-" + file.originalname);
//     },
//   });
//   return storage;
// }
// function getUpload(id) {
//   const upload = multer({ storage: getStorage(id) }).array("images");
//   return upload;
// }

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
      brand,
      category,
      subcategory,
      discount,
      seller_id,
      quantity,
      specification,
    } = req.body;

    let specifyProduct = JSON.stringify(specification);
    conn.query(
      "INSERT INTO pending_products SET ? ",
      {
        id: productId,
        product: product,
        price: price,
        description: description,
        brand: brand,
        category: category,
        subcategory: subcategory,
        discount: discount,
        images: path,
        seller_id: seller_id,
        quantity: quantity,
        specifications: specifyProduct,
      },
      (err, results) => {
        if (err) {
          console.log(err);
        }
      }
    );
  });
});
// app.get("image/:imageName", async (req, res) => {
//   res.sendFile(
//     path.join(__dirname, "uploads", "images", "products", req.params.imageName)
//   );
// });

// delete image function'?
// function deleteImages(image) {
//   let imagePath = path.join(__dirname, image);
//   fs.unlink(imagePath, (err) => {
//     if (err) throw err;
//   });
// }
app.delete("/deleteProduct/:id", async (req, res) => {
  conn.query(
    "SELECT images from pending_products WHERE id = ? ",
    [req.params.id],
    (err, results) => {
      if (err) throw "Error" + err;
      // let images = JSON.parse(results[0].images);
      // images.forEach((image) => {
      //   deleteImages(image);
      // });
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

// app.get("/uploads/images/products/:imageName", (req, res) => {
//   res.sendFile(
//     path.join(__dirname, "uploads", "images", "products", req.params.imageName)
//   );
// });

app.listen(PORT, () => {
  console.log(`Server started on ${PORT}...`);
});
