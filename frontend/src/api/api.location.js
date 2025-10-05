import axios from "axios";

// Create Base URL for the backend server localy using axios
export const axiosInstance = axios.create(
  // URL for the back-end server is running locally
  {
    // baseURL: "http://localhost:3000",

    // URL for the back-end server is running on the render.com web-server
    baseURL: "https://aa-pubic-transport-mapping.onrender.com",
  }
);

//Function to get all buses location
export async function fetchAllBusLocation() {
  try {
    const res = await axiosInstance.get(`/all-bus`);
    // console.log(res.data);
    return res.data;
  } catch (error) {
    console.log(error);
    throw new Error(error.response.data.msg);
  }
}

//Function to get buses terminal data
export async function fetchBusTerminal() {
  try {
    const res = await axiosInstance.get(`/bus-terminals`);
    // console.log(res.data);
    return res.data;
  } catch (error) {
    console.log(error);
    throw new Error(error.response.data.msg);
  }
}

//Function to update a bus location
export async function updateBusLocation(busId) {
  navigator.geolocation
    .watchPosition((position) => {
      const { bus_live_location } = position.coords;
      axiosInstance.post("/update-bus-location", { busId, bus_live_location });
    })
    .then((res) => {
      return res.data;
    })
    .catch((error) => {
      console.error("Error updating location:", error);
    });
}

//function to fetch a bus info, route and location data
export async function getBusLocation(bus_id) {
  try {
    const res = await axiosInstance.get(`/bus-location/${bus_id}`);
    return res.data;
  } catch (error) {
    console.log(error);
    throw new Error(error.response.data.msg);
  }
}
