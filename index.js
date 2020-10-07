const express = require("express");
const multer = require("multer");
const path = require("path");
const uuid = require("uuid");
const mysql = require("mysql");
const conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "yammie_db_secure",
});

conn.connect((err) => {
  if (err) throw err;
  console.log("Database connected....");
});

function getStorage(id) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "productImages/");
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

const PORT = process.env.PORT || 8000;
const app = express();

app.use(express.static("public"));

app.post("/addProduct", async (req, res) => {
  let productId = uuid.v4();
  let upload = getUpload(productId);
  upload(req, res, (err) => {
    if (err) throw err;
    console.log(req.files);
    const {
      product,
      price,
      description,
      brand,
      category,
      subcategory,
      discount,
    } = req.body;
    conn.query(
      "INSERT INTO pending_products SET ?",
      {
        id: productId,
        product: product,
        price: price,
        description: description,
        brand: brand,
        category: category,
        subcategory: subcategory,
        discount: discount,
      },
      (err, results) => {
        if (err) {
          console.log(err);
        } else {
          res.send("Product Added");
        }
      }
    );
  });
});

app.listen(PORT, () => {
  console.log(`Server started on ${PORT}...`);
});
