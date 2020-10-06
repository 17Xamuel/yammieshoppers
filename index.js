const express = require("express");
const multer = require("multer");
const mysql = require("mysql");
const path = require("path");

const storage = multer.diskStorage({
  destination: "./uploads/images/product_images/",
});

const PORT = process.env.PORT || 800;
const app = express();

app.use(express.static("public"));

app.post("/upload", (req, res) => {});

app.listen(PORT, () => {
  console.log(`Server started on ${PORT}...`);
});
