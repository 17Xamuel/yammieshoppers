const path = require("path");
const fs = require("fs");
const mysql = require("mysql8");

// const MYSQL_CONFIG = {
//   host: "yammie-db-secure-do-user-8336351-0.b.db.ondigitalocean.com",
//   user: "yammie",
//   password: "osbzf7q7nqf7qdal",
//   database: "yammie_db",
//   port: 25060,
//   ssl: {
//     ca: fs.readFileSync(path.join(__dirname, "ca.crt")),
//   },
// };
const conn = mysql.createConnection({
  host: "localhost",
  password: "",
  user: "root",
  database: "ck",
});

conn.connect((err) => {
  if (err) throw err;
  console.log("Database connected....");
});

module.exports = conn;
