const express = require("express");
const mysql = require("mysql");

const conn = mysql.createConnection({
  host: "us-cdbr-east-02.cleardb.com",
  user: "b838eb930c84a9",
  password: "3af0fe60",
  database: "heroku_f4061a257bbaada",
});

conn.connect((err) => {
  if (err) throw err;
  console.log("Database connected....");
});

module.exports = conn;
