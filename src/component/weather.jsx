import React, { useEffect, useState } from "react";

const weatherDescriptions = {
  0: "Clear sky ☀️",
  1: "Mainly clear 🌤️",
  2: "Partly cloudy ⛅",
  3: "Overcast ☁️",
  45: "Fog 🌫️",
  48: "Depositing rime fog ❄️",
  51: "Light drizzle 🌦️",
  53: "Moderate drizzle 🌦️",
  55: "Dense drizzle 🌧️",
  61: "Slight rain 🌧️",
  63: "Moderate rain 🌧️",
  65: "Heavy rain 🌧️",
  80: "Rain showers 🌦️",
  95: "Thunderstorm ⛈️",
};

export default function Weather() {
  const [searchPlace, setSearchPlace] = useState("New Delhi");
  const [weather, setWeather] = useState([]);
  const [todaysWeather, setTodatsWeather] = useState({});
  const [time, setTime] = useState([]);
  const [loading, setLoading] = useState(false);
  const handlePlace = (event) => {
    const { value } = event.target;
    setSearchPlace(value);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && searchPlace) {
      fetchData(searchPlace);
    }
  };

  const handleClick = () => {
    if (searchPlace) {
      fetchData(searchPlace);
    }
  };

  useEffect(() => {
    fetchData(searchPlace);
  }, []);

  async function fetchData() {
    setLoading(true);
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${searchPlace}&count=1`
    );
    const data = await res.json();
    const { results } = data;
    fetchWeatherData(results[0].latitude, results[0].longitude);
    fetchHourlyData(results[0].latitude, results[0].longitude);
    setLoading(false);
  }

  async function fetchWeatherData(latitude, longitude) {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,weathercode,windspeed_10m_max&timezone=auto`
    );
    const data = await res.json();
    // console.log(data);
    const times = data.daily.time;
    const temps = data.daily.temperature_2m_max;
    const wind = data.daily.windspeed_10m_max;
    const weather = data.daily.weathercode;
    const merged = times.map((time, i) => {
      const date = new Date(time);
      const day = date.toLocaleString("en-US", { weekday: "short" });
      return {
        day,
        temperature: temps[i],
        wind: wind[i],
        weather: weather[i],
      };
    });

    const [first, ...rest] = merged;

    setWeather(rest);
    setTodatsWeather(first);
  }

  async function fetchHourlyData(latitude, longitude) {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}3&hourly=temperature_2m,weathercode,windspeed_10m&timezone=auto`
    );
    const data = await res.json();
    const hourly = data.hourly;

    const now = new Date();
    const forecastData = [];

    for (let i = 0; i < hourly.time.length; i++) {
      const timeISO = hourly.time[i];
      const timeDate = new Date(timeISO);
      if (timeDate >= now && forecastData.length < 9) {
        forecastData.push({
          time: timeISO.slice(11, 16),
          temp: hourly.temperature_2m[i],
          weather: hourly.weathercode[i],
          windSpeed: hourly.windspeed_10m[i],
        });
      }
    }
    setTime(forecastData);
  }

  return loading ? (
    <div className="w-full h-170 flex justify-center item-center ">
      <p className="w-full h-full text-center m-auto mt-80 text-3xl">
        Loading...
      </p>
    </div>
  ) : (
    <div className="lg:p-8 lg:bg-gray-300 min-h-dvh flex flex-col">
      <div className="h-full w-full flex flex-col lg:flex-row lg:rounded-4xl overflow-hidden flex-1">
        <div className="lg:w-2/3 w-full bg-gray-100 ">
          <header className="flex justify-between p-5 container mx-auto">
            <div className="lg:w-80 w-60 flex border border-gray-400 rounded-full ">
              <input
                type="text"
                name="location"
                id="location"
                className="w-full pl-5 outline-0"
                placeholder="Enter city name"
                value={searchPlace}
                onChange={handlePlace}
                onKeyDown={handleKeyDown}
              />
              <i
                class="fa-solid fa-magnifying-glass p-2"
                onClick={handleClick}
              ></i>
            </div>

            <h1 className="font-semibold">{todaysWeather.day}</h1>
          </header>
          <div className="flex justify-center gap-5 container mx-auto">
            <div>
              <h1 className="pt-8 font-bold lg:text-9xl  text-8xl font-stretch-extra-condensed text-gray-500">
                {todaysWeather.temperature}°
              </h1>
              <h3 className="text-gray-500 text-center lg:text-4xl text-3xl py-5">
                {weatherDescriptions[todaysWeather.weather]}
              </h3>
            </div>
            <div className="pt-25 ">
              <div className="flex gap-2">
                <i class="fa-solid fa-wind"></i>
                <p>{todaysWeather.wind}</p>
              </div>
              <div className="flex gap-2">
                <i class="fa-solid fa-droplet"></i>
                <p>90%</p>
              </div>
            </div>
          </div>

          <div className="lg:flex justify-center items-center lg:gap-8 gap-4 p-5  lg:pt-20 container mx-auto grid grid-cols-3">
            {weather.map((item, index) => (
              <div className="shadow-lg p-5 flex flex-col gap-2 rounded-xl">
                <h1 className="text-lg font-medium">{item.day}</h1>
                <h2 className="text-lg font-medium text-gray-600 ">
                  {item.temperature}°
                </h2>
                <h2 className="text-lg font-medium text-gray-600 ">
                  <i className="fa-solid fa-wind text-sm"></i> {item.wind}
                </h2>
                <h3 className="text-gray-400">
                  {weatherDescriptions[item.weather]}
                </h3>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:w-1/3 w-full bg-gray-200">
          <div>
            <h2 className="text-center p-2 font-md text-lg ">Hourly Forcast</h2>

            <div className="grid grid-cols-3 gap-2 mx-4 p-5">
              {time.map((item, index) => (
                <div className="shadow-lg p-5 flex flex-col gap-2 rounded-xl">
                  <h1>{item.time}</h1>
                  <h2>{item.temp} °</h2>
                  <h2 className="text-lg font-medium text-gray-600 ">
                    <i className="fa-solid fa-wind text-sm"></i>{" "}
                    {item.windSpeed}
                  </h2>
                  <h3 className="text-gray-500">
                    {weatherDescriptions[item.weather]}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
