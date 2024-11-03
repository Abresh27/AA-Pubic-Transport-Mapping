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

export default function Test2() {
  const mapRef = useRef(null); // Use ref to ensure the map is initialized only once
  const busLayerRef = useRef(null); // Ref to store the bus locations layer
  const [busLocations, setBusLocations] = useState([]); // State to store the bus location data
  const [busTerminals, setBusTerminals] = useState([]); // State to store the bus terminal data

  // Define the createBusTerminalLayer function
  const createBusTerminalLayer = (terminals) => {
    const terminalLayer = L.layerGroup();
    terminals.forEach((terminal) => {
      const marker = L.marker([terminal.lat, terminal.lng]).bindPopup(
        terminal.name
      );
      terminalLayer.addLayer(marker);
    });
    return terminalLayer;
  };

  // Initialize map and controls only once
  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map("mapDiv", { zoomControl: false }).setView(
        [8.988853, 38.782425],
        12
      );
      // Add zoom control to the map
      L.control.zoom({ position: "topright" }).addTo(mapRef.current);

      // Add and display the current user location using leaflet.locatecontrol
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
    }

    // Fetch bus terminal data once
    async function getAllBusTerminals() {
      await fetchBusTerminal()
        .then((data) => setBusTerminals(data))
        .catch((err) => console.log(err));
    }
    getAllBusTerminals();
  }, []);

  // Fetch bus locations every 5 seconds
  useEffect(() => {
    async function getAllBusLocation() {
      await fetchAllBusLocation()
        .then((data) => setBusLocations(data))
        .catch((err) => console.log(err));
    }
    const interval = setInterval(getAllBusLocation, 5000);
    return () => clearInterval(interval);
  }, []);

  // Add GeoJSON layers when bus locations or terminals change
  useEffect(() => {
    async function addGeoJSONLayers() {
      const accessToken = "YOUR_ACCESS_TOKEN_HERE";
      const esriStreet = vectorBasemapLayer("arcgis/streets", {
        token: accessToken,
      });
      const busTerminalLayer = createBusTerminalLayer(busTerminals);

      // Create and group the overlay layers
      const groupedOverlayLayers = {
        "Bus Routes": {
          "Anbesa Bus Routes": anbesaBusRout.addTo(mapRef.current),
          "Sheger Bus Routes": shegerBusRout,
          "Aliyance Bus Routes": aliyancBusRout,
        },
        "Bus Stops and Terminals": {
          "Bus Terminals": busTerminalLayer.addTo(mapRef.current),
          "Bus Stops": busStop,
        },
      };

      // Create the base layer
      const baseLayers = {
        "Open Street Map": OSM,
        "Esri Street": esriStreet,
      };

      // Remove existing layer control if it exists
      if (mapRef.current.layerControl) {
        mapRef.current.removeControl(mapRef.current.layerControl);
      }

      // Create a Layers Control and add it to the map
      mapRef.current.layerControl = L.control
        .groupedLayers(baseLayers, groupedOverlayLayers, {
          collapsed: false,
          position: "topleft",
        })
        .addTo(mapRef.current);
    }

    if (mapRef.current) {
      addGeoJSONLayers();
    }
  }, [busLocations, busTerminals]);

  return <div id="mapDiv"></div>;
}
