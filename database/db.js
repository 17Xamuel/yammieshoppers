const path = require("path");
const fs = require("fs");
const mysql = require("mysql8");

const MYSQL_CONFIG = {
  host: "yammie-db-secure-do-user-8336351-0.b.db.ondigitalocean.com",
  user: "yammie",
  password: "osbzf7q7nqf7qdal",
  database: "yammie_db",
  port: 25060,
  ssl: {
    ca: fs.readFileSync(path.join(__dirname, "ca-certificate.crt")),
  },
};
const conn = mysql.createConnection(MYSQL_CONFIG);

conn.connect((err) => {
  if (err) throw "An Error Occured: " + err;
  console.log("Database connected....");
});

module.exports = conn;
