const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const uuid = require("uuid");
const mysql = require("mysql");
const { Storage } = require("@google-cloud/storage");
const conn = require("./database/db.js");

const PORT = process.env.PORT || 8000;
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/api/admin/", require("./routes/adminRoutes"));
app.use("/api/user/", require("./routes/userRoutes"));
app.use("/api/sellers/", require("./routes/sellerRoutes"));

//cloud storage
// const cloudStorage = new Storage({
//   keyFilename: path.join(
//     __dirname + "/speedy-equator-291708-dc81eeec366e.json"
//   ),
//   projectId: "speedy-equator-291708",
// });
// cloudStorage.getBuckets().then((bucket) => {
//   console.log(bucket);
// });
function getStorage(id) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/images/products/");
    },
    filename: (req, file, cb) => {
      cb(null, id + "-" + file.originalname);
    },
  });
  return storage;
}
function getUpload(id) {
  const upload = multer({ storage: getStorage(id) }).array("images");
  return upload;
}

app.use(express.static("public"));

app.post("/addProduct", async (req, res) => {
  let productId = uuid.v4();

  let upload = getUpload(productId);
  upload(req, res, (err) => {
    if (err) throw err;
    let imagePaths = [];
    req.files.forEach((file) => {
      imagePaths.push(file.path);
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
    } = req.body;
    let categories = "";
    if (category == "Electronics") {
      categories = "1";
    }
    // conn.query(
    //   "INSERT INTO pending_products SET ?",
    //   {
    //     id: productId,
    //     product: product,
    //     price: price,
    //     description: description,
    //     brand: brand,
    //     category: categories,
    //     subcategory: subcategory,
    //     discount: discount,
    //     images: path,
    //     seller_id: seller_id,
    //     quantity: quantity,
    //   },
    //   (err, results) => {
    //     if (err) {
    //       console.log(err);
    //     } else {
    //       res.redirect("http://localhost:8000/seller/product.html");
    //     }
    //   }
    // );
  });
});
app.get("/uploads/images/products/:imageName", async (req, res) => {
  res.sendFile(
    path.join(__dirname, "uploads", "images", "products", req.params.imageName)
  );
});

// delete image function
function deleteImages(image) {
  let imagePath = path.join(__dirname, image);
  fs.unlink(imagePath, (err) => {
    if (err) throw err;
  });
}
app.delete("/deleteProduct/:id", async (req, res) => {
  // conn.query(
  //   "SELECT images from pending_products WHERE id = ?",
  //   [req.params.id],
  //   (err, results) => {
  //     if (err) throw "Error" + err;
  //     let images = JSON.parse(results[0].images);
  //     images.forEach((image) => {
  //       deleteImages(image);
  //     });
  //     conn.query(
  //       "DELETE FROM pending_products WHERE id=?",
  //       [req.params.id],
  //       async (err, results) => {
  //         if (err) throw err;
  //         res.send("Deleted");
  //       }
  //     );
  //   }
  // );
});

app.get("/uploads/images/products/:imageName", (req, res) => {
  res.sendFile(
    path.join(__dirname, "uploads", "images", "products", req.params.imageName)
  );
});
app.listen(PORT, () => {
  console.log(`Server started on ${PORT}...`);
});
