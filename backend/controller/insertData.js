const xlsx = require("xlsx");
const connection = require("../config/db.config");
const path = require("path");

// Function to read data from Excel file
async function readExcelFile(filePath) {
  const workbook = xlsx.readFile(filePath); //Find the file to read
  const sheetNames = workbook.SheetNames; //Extract the sheet from the excel file
  const data = {}; //Object to hold the converted JSON data for each sheet.

  sheetNames.forEach((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];
    data[sheetName] = xlsx.utils.sheet_to_json(worksheet); //Convert a worksheet to JSON using  `sheet_to_json` method
  });

  return data;
}

//// Function to insert bus terminal data into MySQL tables
async function insertBusTerminalData(req, res) {
  try {
    const filePath = path.join(__dirname, "../data/bus-terminals-table.xlsx"); // Read local bus terminal data from Excel files
    const busTerminalTable = await readExcelFile(filePath);
    const busTerminalData = busTerminalTable.Sheet1;

    // Loop through each row of bus info data and insert into the database
    for (const busTerminal of busTerminalData) {
      await connection.execute(
        "INSERT INTO bus_terminal_table (terminal_name,terminal_location) VALUES (?,ST_GeomFromText(?))",
        [
          busTerminal.terminal_name,
          `POINT(${busTerminal.longitude} ${busTerminal.latitude})`, //use `POINT(x y)` format to insert coordinate values into a table
        ]
      );
    }
    res.send(`Bus Terminal data inserted`);
  } catch (error) {
    res.send(`Error inserting Bus Terminal data: ${error}`);
  }
}

// Function to insert bus route data into MySQL tables
async function insertBusRouteData(req, res) {
  try {
    const filePath = path.join(__dirname, "../data/bus_route_table.xlsx"); // Read local bus route data from Excel files
    const busRouteTable = await readExcelFile(filePath);
    const busRouteData = busRouteTable.Sheet1;

    // Loop through each row of bus route data and insert into the database
    for (const busRoute of busRouteData) {
      await connection.execute(
        "INSERT INTO bus_route_table (route_number,terminal_id,origin,through,destination,route_name,route_by) VALUES (?,?,?,?,?,?,?)",
        [
          busRoute.route_number,
          busRoute.terminal_id,
          busRoute.origin,
          busRoute.through || null, //Replaced if any value is undefined with null
          busRoute.destination,
          busRoute.route_name,
          busRoute.route_by,
        ]
      );
    }
    res.send(`Bus Route data inserted`);
  } catch (error) {
    res.send(`Error inserting Bus Route data: ${error}`);
  }
}

//// Function to insert bus info data into MySQL tables
async function insertBusInfoData(req, res) {
  try {
    const filePath = path.join(__dirname, "../data/bus_info_table.xlsx"); // Read local bus info data from Excel files
    const busInfoTable = await readExcelFile(filePath);
    const busInfoData = busInfoTable.Sheet1;

    // Loop through each row of bus info data and insert into the database
    for (const busInfo of busInfoData) {
      await connection.execute(
        "INSERT INTO bus_info_table (bus_tag_number,bus_provider,route_id) VALUES (?,?,?)",
        [busInfo.bus_tag_number, busInfo.bus_provider, busInfo.route_id]
      );
    }
    res.send(`Bus Info data inserted`);
  } catch (error) {
    res.send(`Error inserting Bus Info data: ${error}`);
  }
}

module.exports = {
  insertBusRouteData,
  insertBusInfoData,
  insertBusTerminalData,
};
