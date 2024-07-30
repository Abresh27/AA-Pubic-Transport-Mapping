const connection = require("../config/db.config");

//Function to create the table in the database
async function createTable(req, res) {
  let createBusInfoTable = `CREATE TABLE if not exist Bus_Info_Table (
        bus_id INT(20) auto_increment,
        bus_tag_number VARCHAR(20),
        bus_provider VARCHAR(20) not null,
        PRIMARY KEY (bus_id)
    )`;
  let createBusRouteTable = `CREATE TABLE if not exist Bus_Route_Table (
        bus_route_number INT(10),
        bus_route_name VARCHAR(50),
        FOREIGN KEY (bus_id) REFERENCES Bus_Info_Table (bus_id) 
    )`;
  let createBusLocationTable = `CREATE TABLE if not exist Bus_Location_Table (
        bus_live_location POINT,
        FOREIGN KEY (bus_id) REFERENCES Bus_Info_Table (bus_id)
    )`;
  //Executing the above query
  try {
    const busInfoTable = await connection.execute(createBusInfoTable);
    console.log(`Bus Info Table is Created`);
  } catch (error) {
    console.log(`Error found when creating busInfoTable, Error :${error} `);
  }
  try {
    const busRouteTable = await connection.execute(createBusRouteTable);
    console.log(`Bus Route Table is Created`);
  } catch (error) {
    console.log(`Error found when creating busRouteTable, Error :${error} `);
  }
  try {
    const busLocationTable = await connection.execute(createBusLocationTable);
    console.log(`Bus Location Table is Created`);
    res.send(`All tables created`);
  } catch (error) {
    console.log(`Error found when creating busLocationTable, Error :${error} `);
    res.status(500).send("Error creating tables");
  }
}
module.exports = { createTable };
