import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./index.css";
import "leaflet-groupedlayercontrol/dist/leaflet.groupedlayercontrol.min.css";
import "leaflet-groupedlayercontrol";
import { basemapLayer } from "esri-leaflet";
import { busStops } from "../../public/Bus_Stops";
import { busTerminals } from "../../public/Bus_Terminals";

export default function MainMap() {
  const mapRef = useRef(null);
  useEffect(() => {
    if (mapRef.current) {
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
          maxZoom: 19,
          attribution: "© OpenStreetMap",
        }
      ).addTo(map); // Set the default base layer;

      // Create an Esri basemap layer
      const esriWorldImagery = basemapLayer("Imagery");

      //<******** Adding GeoJson In to the map - Using the imported GeoJson file (Js object)**********>Method one(1)
      //Create the icon to style the points
      const busStopIcon = L.icon({
        iconUrl: "./Bus_stop_symbol.svg",
        iconSize: [20, 50],
      });

      const busTerminalIcon = L.icon({
        iconUrl: "./bus-stop-pointer-svgrepo-com.svg",
        iconSize: [30, 40],
      });

      //Adding GeoJson In to the map (The bus stops and terminal)
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
      const busTerminal = L.geoJSON(busTerminals, {
        style: busTerminalIcon,
        pointToLayer: function (feature, latlng) {
          //Convert GeoJSON point marker into Leaflet layers by assigning the created icon to pointToLayer option
          return L.marker(latlng, { icon: busTerminalIcon });
        },
        onEachFeature: function (feature, layer) {
          //Function to bind the popup
          if (feature.properties && feature.properties.terminal_name) {
            layer.bindPopup(
              `<strong>Terminal Name:</strong> ${feature.properties.terminal_name}`
            );
          }
        },
      });

      //<******** Adding GeoJson in to the map - Create a function to fetch the GeoJSON data **********> Method two(2)
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

        //Create and Group the overlay layers
        const groupedOverlayLayers = {
          "Bus Routs": {
            "Anbesa Bus Routs": anbesaBusRout.addTo(map), //Set the default Bus Routs overlay layer
            "Sheger Bus Routs": shegerBusRout,
            "Aliyance Bus Routs": aliyancBusRout,
          },
          "Bus Stops and Terminals": {
            "Bus Stops": busStop.addTo(map),
            //Set the default Bus Stops and Terminals overlay layer
            "Bus Terminals": busTerminal,
          },
        };

        //Create the base layer
        const baseLayers = {
          "Open Street Map": OSM.addTo(map), // Set the default base layer
          "World Imagery": esriWorldImagery,
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

      //Cleanup function from the useEffect hook when the component unmounts to avoid memory leaks.
      return () => {
        map.remove();
      };
    }
  }, []);
  return <div id="mapDiv" ref={mapRef}></div>;
}
