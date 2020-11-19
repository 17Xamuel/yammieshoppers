const express = require("express");
const mysql = require("mysql");

const conn = mysql.createConnection({
  host: "us-cdbr-east-02.cleardb.com",
  user: "b2ed4a370a3aae",
  password: "0db01b7e",
  database: "heroku_ddb34418618ebc1",
});

conn.connect((err) => {
  if (err) throw err;
  console.log("Database connected....");
});

module.exports = conn;
