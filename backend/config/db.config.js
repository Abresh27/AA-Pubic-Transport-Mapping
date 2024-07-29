//Import the dotenv to load environment variables from the .env file
require("dotenv").config();
const mySql = require("mysql2");

//Create connection with the fallowing user and database
const dbConfig = {
  user: process.env.USER,
  password: process.env.PASSWORD,
  host: process.env.HOST,
  database: process.env.DATABASE,
};

//This method creates a pool of multiple connections to the MySQL database.
const connection = mySql.createPool(dbConfig);

//Test connection with the database
connection.execute("SELECT 'connected with the DB'", (err, result) => {
  if (err) console.log(err.message);
  console.log(result);
});

module.exports = connection.promise();
