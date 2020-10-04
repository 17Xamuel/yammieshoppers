const express = require("express");

const app = express();

app.use(express.static("public"));
// app.use("publi/styles", express.static(__dirname + "/public/styles"));

app.listen(3030, () => {
  console.log("Server Started on 3030");
});
