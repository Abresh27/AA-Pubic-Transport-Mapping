const connection = require("../config/db.config");

//Function to create the table in the database

async function createBusTerminalTable(req, res) {
  let createBusTerminalTable = `CREATE TABLE if not exists bus_terminal_table (
        terminal_id INT(20) auto_increment,
        terminal_name VARCHAR(30),
        terminal_location POINT,
        PRIMARY KEY (terminal_id)
    )`;
  let busTerminalTable;
  try {
    busTerminalTable = await connection.execute(createBusTerminalTable);
    res.send(`Bus Terminal Table is Created`);
  } catch (error) {
    res
      .status(500)
      .send(`Error found when creating busTerminalTable,${error} `);
  }
}

async function createBusRouteTable(req, res) {
  let createBusRouteTable = `CREATE TABLE if not exists bus_route_table (
        route_id INT(20) auto_increment,
        route_number VARCHAR(10),
        terminal_id INT(20),
        origin VARCHAR(30),
        through VARCHAR(30),
        destination VARCHAR(30),
        route_name VARCHAR(60),
        route_by VARCHAR(20),
        PRIMARY KEY (route_id),
        FOREIGN KEY (terminal_id) REFERENCES bus_terminal_table (terminal_id)
    )`;
  //Executing the above query
  let busRouteTable;
  try {
    busRouteTable = await connection.execute(createBusRouteTable);
    res.send(`Bus Route Table is Created`);
  } catch (error) {
    res.status(500).send(`Error found when creating busRouteTable, ${error} `);
  }
}
async function createBusInfoTable(req, res) {
  let createBusInfoTable = `CREATE TABLE if not exists bus_info_table (
        bus_id INT(20) auto_increment,
        bus_tag_number VARCHAR(20) not null,
        bus_provider VARCHAR(20) not null,
        route_id INT(20),
        PRIMARY KEY (bus_id),
        FOREIGN KEY (route_id) REFERENCES bus_route_table (route_id)
    )`;
  let busInfoTable;
  try {
    busInfoTable = await connection.execute(createBusInfoTable);
    res.send(`Bus Info Table is Created`);
  } catch (error) {
    res.status(500).send(`Error found when creating busInfoTable, ${error} `);
  }
}
async function createBusLocationTable(req, res) {
  let createBusLocationTable = `CREATE TABLE if not exists bus_location_table (
        bus_id INT(20),
        bus_live_location POINT,
        PRIMARY KEY (bus_id),
        FOREIGN KEY (bus_id) REFERENCES bus_info_table (bus_id)
    )`;
  let busLocationTable;
  try {
    busLocationTable = await connection.execute(createBusLocationTable);
    res.send(`Bus Location Table is Created`);
  } catch (error) {
    res
      .status(500)
      .send(`Error found when creating busLocationTable,${error} `);
  }
}

module.exports = {
  createBusRouteTable,
  createBusInfoTable,
  createBusLocationTable,
  createBusTerminalTable,
};
