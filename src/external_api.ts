import axios from "axios"

// Replace 'YOUR_API_KEY' with your OpenWeatherMap API key
export const retrieveWeather = async (city: string, day: number) => {
    const apiKey = process.env.API_KEY;
    const apiUrl = `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=${day}&aqi=no&alerts=no`;
    try {
      //  Make a GET request using axios
      const response = await axios.get(apiUrl);

      // Check if the request was successful (status code 2xx)
      if (response.status !== 200) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Access the data from the response
      const data = response.data;

      // Process the data or return it
      // console.log('Fetched data with axios:', data);
      return data;
  }
    catch (error) {
    throw error; // Optionally rethrow the error
  }
}
