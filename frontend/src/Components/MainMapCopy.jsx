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

export default function MainMap() {
  const mapRef = useRef(null); //useRef to ensure that the map is initialized only once
  const busLayerRef = useRef(null); // Ref to store the bus locations layer
  const [busLocations, setBusLocations] = useState([]); //state to store the bus location data
  const [busTerminals, setBusTerminals] = useState([]); //state to store the bus terminal data

  //useEffect hook to load the map elements when the component is mounted
  useEffect(() => {
    // Create the map and set its initial view
    if (!mapRef.current) {
      //Create a map and add the default created base layers to the map
      mapRef.current = L.map("mapDiv", { zoomControl: false }).setView(
        [8.988853, 38.782425],
        12
      );
      // Add zoom control to the map (Modifying the default zoom control properties )
      L.control.zoom({ position: "topright" }).addTo(mapRef.current);
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
            maxZoom: 50,
            enableHighAccuracy: true,
          },
        })
        .addTo(mapRef.current);
      //Function to fetch bus terminal data from the database
      async function getAllBusTerminals() {
        await fetchBusTerminal() //Use the function created in the API to get all the bus terminal
          .then((data) => setBusTerminals(data))
          .catch((err) => console.log(err));
      }
      getAllBusTerminals();
    }
  }, []);
  useEffect(() => {
    //Function to get all the bus terminals from the database
    //<*****Adding layers fetched from the database (bus Terminal data)******> Using Markers>Method one(1)
    //Option 1: Create a function to create bus terminal markers
    // busTerminals.forEach((terminal) => {
    //   L.marker([terminal.terminal_location.y, terminal.terminal_location.x])
    //     .addTo(map)
    //     .bindPopup(`Terminal ID: ${terminal.terminal_id}`);
    // });

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
    //<******** Adding GeoJson file from local storage in to the map - Using the imported GeoJson file as Js object (The bus stops)**********>Method one(1)
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
    // Function to create all the layer either fetched from the database or imported from local storage
    //Create the overlay layers to group them on the layer control
    async function createLayers() {
      const anbesaBusRout = await fetchGeoJSON("./AnbesaBusRoutes.json", {
        style: {
          color: "#e90a0a",
        },
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
      });
      const shegerBusRout = await fetchGeoJSON("./ShegerBusRoutes.json", {
        style: {
          color: "#1d91c0",
        },
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
        style: {
          color: "#fff933",
        },
        onEachFeature: function (feature, layer) {
          //Function to bind the popup
          if (feature.properties && feature.properties.BEGIN) {
            layer.bindPopup(
              `<strong>Aliance Bus Route Number:</strong> ${feature.properties.BEGIN}`
            );
          }
        },
      });
      //Create the bus terminal overlay layer using the function createBusTerminalLayer
      const busTerminalLayer = await createBusTerminalLayer(busTerminals); // Wait for the LayerGroup to be created
      //Create the base layers
      //Create the base map tile layer from open street map
      const OSM = L.tileLayer(
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          // maxZoom: 16,
          attribution: "© OpenStreetMap",
        }
      ).addTo(mapRef.current); // Set the default base layer;

      //Create an Esri basemap layer
      const accessToken =
        "AAPKd1b17caf87f8487294ad231e921f3b4eczRnXS6Ms1S86_zljbXg34zqZP0KY8ZNUg3_NWxWWVYTwXlbhbGRpw1A5GsgRZuU";
      const esriStreet = vectorBasemapLayer("arcgis/streets", {
        token: accessToken,
      });

      //Group the overlay layers
      const groupedOverlayLayers = {
        "Bus Routs": {
          "Anbesa Bus Routs": anbesaBusRout.addTo(mapRef.current), //Set the default Bus Routs overlay layer
          "Sheger Bus Routs": shegerBusRout,
          "Aliyance Bus Routs": aliyancBusRout,
        },
        "Bus Stops and Terminals": {
          "Bus Terminals": busTerminalLayer.addTo(mapRef.current), //Set the default Bus Stops and Terminals overlay layer
          "Bus Stops": busStop,
        },
      };
      //Group the base layer
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
        .addTo(mapRef.current);
    }
    createLayers();
  }, [busTerminals]);
  // useEffect hook to fetch bus locations every 5 seconds from the database
  useEffect(() => {
    async function getAllBusLocation() {
      await fetchAllBusLocation()
        .then((data) => setBusLocations(data))
        .catch((err) => console.log(err));
    }
    getAllBusLocation(); // Initial load
    const interval = setInterval(getAllBusLocation, 5000); // Fetch every 5 seconds
    return () => clearInterval(interval);
  }, []);
  //useEffect hook to add the update bus location every five seconds
  useEffect(() => {
    //<*****Adding layers fetched from the database (bus location data)******>Using Geojson>Method one(2)
    // Create bus locations GeoJSON layer
    const busLocationgeojson = {
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
    //Adding the geojson buses location point data
    //Create the icon to style the bus location points
    const shegerBusIcon = L.icon({
      iconUrl: "./sheger-bus-com.svg",
      iconSize: [20, 50],
    });
    const anbesaBusIcon = L.icon({
      iconUrl: "./anbesa-bus-com.svg",
      iconSize: [20, 50],
    });
    // Remove the old bus layer if it exists
    if (busLayerRef.current) {
      mapRef.current.removeLayer(busLayerRef.current);
    }
    // Add new bus layer with updated data
    busLayerRef.current = L.geoJSON(busLocationgeojson, {
      pointToLayer: function (feature, latlng) {
        // Check the bus provider and assign the appropriate icon
        if (feature.properties.bus_provider === "Sheger") {
          return L.marker(latlng, { icon: shegerBusIcon });
        } else {
          return L.marker(latlng, { icon: anbesaBusIcon });
        }
      },
      //Create the pop-up text for each bus location points
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
  }, [busLocations]); //Dependency to re-render the bus location layer every five seconds
  return <div id="mapDiv"></div>;
}
