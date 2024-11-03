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
export default function Test() {
  const mapRef = useRef(null);
  const [busLocations, setBusLocations] = useState([]);
  const busLayerRef = useRef(null); // Ref to store the bus locations layer

  useEffect(() => {
    // Create the map and set its initial view
    if (!mapRef.current) {
      mapRef.current = L.map("mapDiv", { zoomControl: false }).setView(
        [8.988853, 38.782425],
        12
      );
      // Add zoom control to the map
      L.control.zoom({ position: "topright" }).addTo(mapRef.current);

      // Add the base tile layer
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(mapRef.current);
    }

    // Fetch bus locations every 5 seconds
    async function getAllBusLocation() {
      await fetchAllBusLocation()
        .then((data) => setBusLocations(data))
        .catch((err) => console.log(err));
    }

    getAllBusLocation(); // Initial load
    const interval = setInterval(getAllBusLocation, 5000); // Fetch every 5 seconds
    return () => clearInterval(interval);
  }, []);

  //Use the useEffect hook to create a function to get all the bus locations and terminals from the database
  useEffect(() => {
    // Create GeoJSON layer for bus locations
    const geojsonData = {
      type: "FeatureCollection",
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
    busLayerRef.current = L.geoJSON(geojsonData, {
      pointToLayer: function (feature, latlng) {
        if (feature.properties.bus_provider === "Sheger") {
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
          <strong>Destination:</strong> ${feature.properties.destination}`
        );
      },
    }).addTo(mapRef.current);
  }, [busLocations]);

  return <div id="mapDiv" style={{ height: "100vh" }}></div>;
}
