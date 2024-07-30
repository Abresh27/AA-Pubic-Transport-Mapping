const express = require("express");
const app = express();
const router = express.Router();
const { createTable } = require(`./controller/createTable`);

//Route to create the tables in the database
router.get("/createtable", createTable);

//Listener
const PORT = 3000;
app.listen(PORT, (err) => {
  if (err) throw err;
  else console.log(`The server is running on ${PORT}`);
});
