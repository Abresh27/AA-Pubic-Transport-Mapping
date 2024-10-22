const express = require("express");
const app = express();
//Import the cors module to pass the cors policy
const cors = require("cors");
const {
  createBusRouteTable,
  createBusInfoTable,
  createBusLocationTable,
  createBusTerminalTable,
} = require(`./controller/createTable`);
const {
  insertBusRouteData,
  insertBusInfoData,
  insertBusTerminalData,
} = require(`./controller/insertData`);

const {
  getAllBusLocation,
  getBusinfo,
  updateBusLocation,
  getBusTerminal,
} = require("./controller/location");

//Middleware to send all the request as a json data (JSON Parsing Middleware)
app.use(express.json());
//Middleware to pass the cors policy
app.use(cors());

//Route to check the back-end server is running
app.get("/", (req, res) => {
  res.send("Running");
});

//Route to create the tables in the database
app.get("/create-bus-route-table", createBusRouteTable);
app.get("/create-bus-info-table", createBusInfoTable);
app.get("/create-bus-location-table", createBusLocationTable);
app.get("/create-bus-terminal-table", createBusTerminalTable);

//Route to insert the data from Excel tables(local) into the database
app.get("/insertbusroutedata", insertBusRouteData);
app.get("/insertbusinfodata", insertBusInfoData);
app.get("/insertbusterminaldata", insertBusTerminalData);

//Route to fetch all bus location data
app.get("/all-bus", getAllBusLocation);

//Route to fetch bus terminal data
app.get("/bus-terminals", getBusTerminal);

//Route to update bus location
app.post("/update-bus-location", updateBusLocation);

//Route to fetch a bus info, route and location data
// app.get("/bus-location/:bus_id", getBusinfo);

//Listener
const PORT = 3000;
app.listen(PORT, (err) => {
  if (err) throw err;
  else console.log(`The server is running on ${PORT}`);
});
