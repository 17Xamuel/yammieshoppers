const express = require("express");
const mysql = require("mysql");

const conn = mysql.createConnection({
  host: "yammie-do-user-8336351-0.b.db.ondigitalocean.com",
  user: "doadmin",
  password: "nw61grac0k3gmh9v",
  database: "defaultdb",
});

conn.connect((err) => {
  if (err) throw err;
  console.log("Database connected....");
});

module.exports = conn;
