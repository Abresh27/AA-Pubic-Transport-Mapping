const express = require("express");
const connection = require("./config/db.config");
const app = express();

const PORT = 3000;

//Listener
app.listen(PORT, (err) => {
  if (err) throw err;
  else console.log(`The server is running on ${PORT}`);
});
