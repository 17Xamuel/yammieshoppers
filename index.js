const express = require("express");

const PORT = process.env.PORT || 800;
const app = express();

app.use(express.static("public"));

app.listen(PORT, () => {
  console.log(`Server started on ${PORT}...`);
});
