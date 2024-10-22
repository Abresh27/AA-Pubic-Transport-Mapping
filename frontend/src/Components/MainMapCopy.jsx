import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./index.css";
import "leaflet-groupedlayercontrol/dist/leaflet.groupedlayercontrol.min.css";
import "leaflet-groupedlayercontrol";
import { vectorBasemapLayer } from "esri-leaflet-vector";
import { busStops } from "../../public/Bus_Stops";
import { fetchAllBusLocation, fetchBusTerminal } from "../api/api.location";
import "leaflet.locatecontrol/dist/L.Control.Locate.min.css";
import "leaflet.locatecontrol";

export default function MainMapCopy() {
  const mapRef = useRef(null);
  //Use the useEffect hook to create a function to get all the bus locations and terminals from the database
  // Fetch bus locations from the database
  const [busLocations, setBusLocations] = useState([]); //state to store the bus location data
  async function fetchAllBusLocations() {
    await fetchAllBusLocation() //Use the function created in the API to get all the bus locations
      .then((data) => setBusLocations(data))
      .catch((err) => console.log(err));
  }
  useEffect(() => {
    if (!mapRef.current) {
      //Create a map and add the default created base layers to the map
      const map = L.map("mapDiv", { zoomControl: false }).setView(
        [8.988853, 38.782425],
        12
      );
      // Add zoom control to the map (Modifying the default zoom control properties )
      L.control.zoom({ position: "topright" }).addTo(map);

      //Create a base layers base maps
      //Create the tile layer from open street map
      const OSM = L.tileLayer(
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          maxZoom: 16,
          attribution: "© OpenStreetMap",
        }
      ).addTo(map); // Set the default base layer;

      // Create an Esri basemap layer
      const accessToken =
        "AAPKd1b17caf87f8487294ad231e921f3b4eczRnXS6Ms1S86_zljbXg34zqZP0KY8ZNUg3_NWxWWVYTwXlbhbGRpw1A5GsgRZuU";
      const esriStreet = vectorBasemapLayer("arcgis/streets", {
        token: accessToken,
      });
      mapRef.current = map;
    }
    //Option 2: Create a function to create bus terminal markers (using async await to add it into the layer control)
    //Create the icon to style the points
    const busTerminalIcon = L.icon({
      iconUrl: "./bus-stop-pointer-svgrepo-com.svg",
      iconSize: [40, 50],
    });
    async function createBusTerminalLayer(layers) {
      const terminalLayerGroup = L.layerGroup(); // Create a LayerGroup to hold the markers
      try {
        layers.forEach((terminal) => {
          const marker = L.marker(
            [terminal.terminal_location.y, terminal.terminal_location.x],
            {
              icon: busTerminalIcon,
            }
          ).bindPopup(
            `<center><h3 style="display: inline;">Terminal Name:</h3> <strong>${terminal.terminal_name}</strong></center><br>
              <h3 style="display: inline;">Destinations:</h3><br> <strong>${terminal.route_details}</strong>`
          );
          terminalLayerGroup.addLayer(marker); // Add each marker to the LayerGroup
        });
      } catch (error) {
        console.error(
          "An error occurred while creating bus terminal markers:",
          error
        );
      }
      return terminalLayerGroup; // Return the LayerGroup
    }

    //<******** Adding GeoJson file from local storage in to the map - Using the imported GeoJson file (Js object)**********>Method one(1)
    //Create the icon to style the points
    const busStopIcon = L.icon({
      iconUrl: "./bus-stop-svgrepo-com-bw.svg",
      iconSize: [30, 50],
    });

    //Adding GeoJson In to the map (The bus stops)
    const busStop = L.geoJSON(busStops, {
      style: busStopIcon,
      pointToLayer: function (feature, latlng) {
        //Convert GeoJSON point marker into Leaflet layers by assigning the created icon to pointToLayer option
        return L.marker(latlng, { icon: busStopIcon });
      },
      onEachFeature: function (feature, layer) {
        //Function to bind the popup
        if (feature.properties && feature.properties.stop_name) {
          layer.bindPopup(
            `<strong>Bus Stop:</strong> ${feature.properties.stop_name}`
          );
        }
      },
    });

    //<******** Adding GeoJson file from local storage in to the map - Create a function to fetch the GeoJSON data (The Bus routs) **********> Method two(2)
    async function fetchGeoJSON(geoJsonUrl, layerOptions) {
      try {
        const response = await fetch(geoJsonUrl); //file need to be in the public folder
        const data = await response.json(); //Convert the response to JSON using `.json()`
        return L.geoJSON(data, layerOptions);
      } catch (error) {
        console.error(
          `Error loading the GeoJSON data from ${geoJsonUrl}:`,
          error
        );
      }
    }

    //Styling the bus rout layers
    const anbesaBusRoutStyle = {
      color: "#e90a0a",
    };
    const shegerBusRoutStyle = {
      color: "#1d91c0",
    };
    const aniyancBusRoutStyle = {
      color: "#fff933",
    };
    // Function to add the GeoJSON data to the map (The Bus routs)
    async function addGeoJSONLayers() {
      const anbesaBusRout = await fetchGeoJSON("./AnbesaBusRoutes.json", {
        style: anbesaBusRoutStyle,
        onEachFeature: function (feature, layer) {
          //Function to bind the popup
          if (
            (feature.properties && feature.properties.Route_Name) ||
            feature.properties.Route_Route_No
          ) {
            layer.bindPopup(
              `<strong>Anbesa Bus Route Number:</strong> ${feature.properties.Route_No} <br/> <strong>Anbesa Bus Route Name:</strong> ${feature.properties.Route_Name}`
            );
          }
        },
      }); //add styling using the style option
      const shegerBusRout = await fetchGeoJSON("./ShegerBusRoutes.json", {
        style: shegerBusRoutStyle,
        onEachFeature: function (feature, layer) {
          //Function to bind the popup
          if (feature.properties && feature.properties.DIGI_STATU) {
            layer.bindPopup(
              `<strong>Sheger Bus Route Number:</strong> ${feature.properties.DIGI_STATU}`
            );
          }
        },
      });
      const aliyancBusRout = await fetchGeoJSON("./AlianceBusRoutes.json", {
        style: aniyancBusRoutStyle,
        onEachFeature: function (feature, layer) {
          //Function to bind the popup
          if (feature.properties && feature.properties.BEGIN) {
            layer.bindPopup(
              `<strong>Aliance Bus Route Number:</strong> ${feature.properties.BEGIN}`
            );
          }
        },
      });

      //Create the bus terminal layer using the function createBusTerminalLayer
      const busTerminalLayer = await createBusTerminalLayer(busTerminals); // Wait for the LayerGroup to be created

      //Create and Group the overlay layers
      const groupedOverlayLayers = {
        "Bus Routs": {
          "Anbesa Bus Routs": anbesaBusRout.addTo(map), //Set the default Bus Routs overlay layer
          "Sheger Bus Routs": shegerBusRout,
          "Aliyance Bus Routs": aliyancBusRout,
        },
        "Bus Stops and Terminals": {
          "Bus Terminals": busTerminalLayer.addTo(map), //Set the default Bus Stops and Terminals overlay layer
          "Bus Stops": busStop,
        },
      };

      //Create the base layer
      const baseLayers = {
        "Open Street Map": OSM, // Set the default base layer
        "Esri Street": esriStreet,
      };

      //Create a Layers Control and add it to the map
      L.control
        .groupedLayers(baseLayers, groupedOverlayLayers, {
          collapsed: false,
          position: "topleft", //Create the options to the property of layer controller
        })
        .addTo(map);
    }
    addGeoJSONLayers();

    //Add and dispalay the current user location using leaflet.locatecontrol module
    L.control
      .locate({
        position: "topright",
        flyTo: true,
        drawCircle: false,
        showPopup: false,
        strings: {
          title: "",
        },
        locateOptions: {
          maxZoom: 15,
          enableHighAccuracy: true,
        },
      })
      .addTo(map);
  }, []);

  // Fetch bus terminal layer from the database
  const [busTerminals, setBusTerminals] = useState([]); //state to store the bus location data
  useEffect(() => {
    async function getBusTerminals() {
      await fetchBusTerminal() //Use the function created in the API to get all the bus locations
        .then((data) => setBusTerminals(data))
        .catch((err) => console.log(err));
    }
    getBusTerminals();

    // Fetch initial bus locations
    fetchAllBusLocations();
    // Set up an interval to update bus locations every 10 seconds (adjust as needed)
    const intervalId = setInterval(() => {
      fetchAllBusLocations();
    }, 10000);
    //Cleanup function from the useEffect hook when the component unmounts to avoid memory leaks.
    return () => {
      map.remove();
      // Cleanup interval on component unmount
      clearInterval(intervalId);
    };
  }, []);

  //Use effect hook to load the map
  useEffect(() => {
    if (mapRef.current && busLocations.length > 0 && busTerminals.length > 0) {
      //<*****Adding layers fetched from the database (bus Terminal data)******> Using Markers>Method one(1)
      //Option 1: Create a function to create bus terminal markers
      // busTerminals.forEach((terminal) => {
      //   L.marker([terminal.terminal_location.y, terminal.terminal_location.x])
      //     .addTo(map)
      //     .bindPopup(`Terminal ID: ${terminal.terminal_id}`);
      // });

      //<*****Adding layers fetched from the database (bus location data)******>Using Geojson>Method one(2)
      // Remove existing layers before adding new ones
      // mapRef.current.eachLayer((layer) => {
      //   if (layer.options && layer.options.pane === "markerPane") {
      //     mapRef.current.removeLayer(layer);
      //   }
      // });
      const geojsonData = {
        type: "FeatureCollection",
        //mapping the array returned from the database
        features: busLocations.map((bus) => ({
          type: "Feature",
          properties: {
            bus_id: bus.bus_id,
            bus_provider: bus.bus_provider,
            route_number: bus.route_number,
            origin: bus.origin,
            through: bus.through,
            destination: bus.destination,
            route_name: bus.route_name,
          },
          geometry: {
            type: "Point",
            coordinates: [bus.bus_live_location.x, bus.bus_live_location.y],
          },
        })),
      };

      //Adding the geojson buses point data
      //Create the icon to style the bus points
      const shegerBusIcon = L.icon({
        iconUrl: "./sheger-bus-com.svg",
        iconSize: [20, 50],
      });
      const anbesaBusIcon = L.icon({
        iconUrl: "./anbesa-bus-com.svg",
        iconSize: [20, 50],
      });
      L.geoJSON(geojsonData, {
        style: shegerBusIcon || anbesaBusIcon,
        pointToLayer: function (feature, latlng) {
          // Check the bus provider and assign the appropriate icon
          if (feature.properties.bus_provider == "Sheger") {
            return L.marker(latlng, { icon: shegerBusIcon });
          } else {
            return L.marker(latlng, { icon: anbesaBusIcon });
          }
        },
        onEachFeature: (feature, layer) => {
          layer.bindPopup(
            `<h3><center>${feature.properties.route_name}</center></h3>
            <strong>Bus provider:</strong> ${feature.properties.bus_provider}<br>
            <strong>Route Number:</strong> ${feature.properties.route_number}<br>
            <strong>Origin:</strong> ${feature.properties.origin}<br>
            <strong>Through:</strong> ${feature.properties.through}<br>
            <strong>Destination:</strong> ${feature.properties.destination} `
          );
        },
      }).addTo(mapRef.current);
    }
  }, [busLocations]); //Dependency to re-render the map whenever there is a change in busLocations data

  return <div id="mapDiv" ref={mapRef}></div>;
}
