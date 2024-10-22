const connection = require("../config/db.config");

//Function to get all buses location with their info and route
async function getAllBusLocation(req, res) {
  try {
    const [allBusLocationData] = await connection.execute(
      "SELECT bus_location_table.*, bus_info_table.bus_provider, bus_route_table.route_number, bus_route_table.origin, bus_route_table.through, bus_route_table.destination, bus_route_table.route_name FROM bus_location_table INNER JOIN bus_info_table ON bus_location_table.bus_id = bus_info_table.bus_id INNER JOIN bus_route_table ON bus_info_table.route_id = bus_route_table.route_id"
    );
    res.status(200).json(allBusLocationData);
  } catch (error) {
    res.status(500).send(`Error in fetching all bus location ${error}`);
  }
}

//Function to get all buses location with their info and route
async function getBusTerminal(req, res) {
  try {
    const [busTerminalData] = await connection.execute(
      "SELECT bus_terminal_table.*, GROUP_CONCAT(CONCAT(bus_route_table.destination,' - ', bus_route_table.route_number, ' (', bus_route_table.route_by, ') ')ORDER BY bus_route_table.destination SEPARATOR '<br>') AS route_details FROM bus_terminal_table INNER JOIN bus_route_table ON bus_terminal_table.terminal_id = bus_route_table.terminal_id GROUP BY bus_terminal_table.terminal_id"
    );
    res.status(200).json(busTerminalData);
  } catch (error) {
    res.status(500).send(`Error in fetching bus terminals ${error}`);
  }
}

//function to update buses location
async function updateBusLocation(req, res) {
  try {
    const { bus_id, longitude, latitude } = req.body;
    await connection.execute(
      "REPLACE INTO bus_location_table (bus_id, bus_live_location) VALUES (?, ST_GeomFromText(?))",
      [bus_id, `POINT(${longitude} ${latitude})`]
    );
    res.status(201).json({ msg: "Bus location Updated" });
  } catch (error) {
    res.status(500).send(`Error in updating bus location ${error}`);
  }
}

//Function to fetch a bus info, route and location data
// async function getBusinfo(req, res) {
//   try {
//     const [busInfoData] = await connection.execute(
//       "SELECT bus_info_table.*, bus_route_table.route_number, bus_route_table.origin, bus_route_table.through, bus_route_table.destination, bus_route_table.route_name, bus_location_table.bus_live_location FROM bus_info_table INNER JOIN bus_route_table ON bus_info_table.route_id = bus_route_table.route_id INNER JOIN bus_location_table ON bus_info_table.bus_id = bus_location_table.bus_id WHERE bus_info_table.bus_id = ?",
//       [req.params.bus_id]
//     );
//     res.status(200).json(busInfoData);
//   } catch (error) {
//     res.status(500).send(`Error in fetching bus info ${error}`);
//   }
// }

module.exports = { updateBusLocation, getAllBusLocation, getBusTerminal };
