import React, { useEffect, useRef } from "react";
import L, { latLng } from "leaflet";
import "leaflet/dist/leaflet.css";
import "./index.css";
import "leaflet-groupedlayercontrol/dist/leaflet.groupedlayercontrol.min.css";
import "leaflet-groupedlayercontrol";

export default function MainMap() {
  const mapRef = useRef(null);
  useEffect(() => {
    if (mapRef.current) {
      //Creat a map and add the default created base layers to the map
      const map = L.map("mapDiv", { zoomControl: false }).setView(
        [8.988853, 38.782425],
        12
      );
      // Add zoom control to the map (Modifying the default zoom control properties )
      L.control.zoom({ position: "topright" }).addTo(map);
      //Create the tile layer (base layer)
      const OSM = L.tileLayer(
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          maxZoom: 19,
          attribution: "© OpenStreetMap",
        }
      ).addTo(map); // Set the default base layer;

      const satellite = L.tileLayer(
        "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
        {
          maxZoom: 17,
          attribution: "Map data: © OpenStreetMap contributors",
        }
      );
      // Function to fetch the GeoJSON data
      async function fetchGeoJSON(geoJsonUrl, layerStyle) {
        try {
          const response = await fetch(geoJsonUrl); //file need to be in the public folder
          const data = await response.json(); //Convert the response to JSON using `.json()`
          return L.geoJSON(data, { style: layerStyle });
        } catch (error) {
          console.error(
            `Error loading the GeoJSON data from ${geoJsonUrl}:`,
            error
          );
        }
      }
      //Styling the layers
      const anbesaBusRoutStyle = {
        color: "#e90a0a",
      };
      const shegerBusRoutStyle = {
        color: "#1d91c0",
      };
      const aniyancBusRoutStyle = {
        color: "#fff933",
      };
      const busStopStyle = {
        radius: 8,
        fillColor: "#00FF00",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8,
      };

      const busTerminalStyle = {
        radius: 10,
        fillColor: "#0000FF",
        color: "#000",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9,
      };
      // Function to add the GeoJSON data to the map
      async function addGeoJSONLayers() {
        const anbesaBusRout = await fetchGeoJSON("./AnbesaBusRout.json", {
          style: anbesaBusRoutStyle,
        }); //add styling using the style option
        const shegerBusRout = await fetchGeoJSON("./ShegerBusRout.json", {
          style: shegerBusRoutStyle,
        });

        const aliyancBusRout = await fetchGeoJSON("./AlianceBusRout.json", {
          style: aniyancBusRoutStyle,
        });
        const busStops = await fetchGeoJSON("./BusStops.json", {
          pointToLayer: L.marker(latLng),
        });
        const busTerminals = await fetchGeoJSON("./BusTerminals.json", {
          pointToLayer: L.marker(latLng),
        });
        //Create the overlay layers
        const groupedOverlayLayers = {
          "Bus Routs": {
            "Anbesa Bus Routs": anbesaBusRout ? anbesaBusRout.addTo(map) : null, //Set the default overlay layer
            "Sheger Bus Routs": shegerBusRout,
            "Aliyance Bus Routs": aliyancBusRout,
          },
          "Bus Stops and Terminals": {
            "Bus Stops": busStops.addTo(map),
            "Bus Terminals": busTerminals,
          },
        };
        //Create the base layer

        const BaseLayers = {
          "Open Street Map": OSM.addTo(map), // Set the default base layer
          Satellite: satellite,
        };

        // const groupedBaseLayers = { //This is not functional
        //   "Base map": {
        //     "Open Street Map": OSM,
        //     Satellite: satellite,
        //   },
        // };

        //Create the options to the property of layer controller
        const option = {
          collapsed: false,
          position: "topleft",
        };

        //Create a Layers Control and add it to the map
        const LayerControl = L.control
          .groupedLayers(BaseLayers, groupedOverlayLayers, option)
          .addTo(map);
      }

      addGeoJSONLayers(); // Call the function to add GeoJSON layers

      //Cleanup function from the useEffect hook when the component unmounts
      return () => {
        map.remove();
      };
    }
  }, []);
  return <div id="mapDiv" ref={mapRef}></div>;
}
