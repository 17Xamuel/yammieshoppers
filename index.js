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

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "productImages/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

const PORT = process.env.PORT || 8000;
const app = express();

app.use(express.static("public"));

app.post("/addProduct", upload.array("images"), async (req, res) => {
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
      id: uuid.v4(),
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

app.listen(PORT, () => {
  console.log(`Server started on ${PORT}...`);
});
