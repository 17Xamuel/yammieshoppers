const express = require("express");
const path = require("path");
const multer = require("multer");
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

const PORT = process.env.PORT || 8000;
const app = express();

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
        images: path,
        seller_id: seller_id,
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
app.get("/uploads/images/products/:imageName", (req, res) => {
  res.sendFile(
    path.join(__dirname, "uploads", "images", "products", req.params.imageName)
  );
});

app.listen(PORT, () => {
  console.log(`Server started on ${PORT}...`);
});
