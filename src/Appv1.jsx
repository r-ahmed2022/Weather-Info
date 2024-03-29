/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import noweather from   './noweather.png'

const KEY = "cf6967fd1784732aebe4bdb9186f3879";

function convertToFlag(countryCode) {
  const codePoints = countryCode
    //  .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

function formatDay(dateStr) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
  }).format(new Date(dateStr));
}
export default function Appv1() {
  const [isLocal, setIsLocal] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState({});
  const [error, setError] = useState(null);
  const [city, setCity] = useState({location: '', status: false});
  const [displayLocation, setDisplayLocation] = useState("");
  const [moreInfo, setMoreInfo] = useState(false);
  const [weatherData, setWeatherData] = useState({
    localWeather: {},
    tempWeather: {},
    weather: {},
  });

  useEffect(function () {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(handleSuccess, handleError);
    } else {
      setError(new Error("Geolocation is not supported."));
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    async function handleChange() {
      await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${displayLocation}&appid=cf6967fd1784732aebe4bdb9186f3879&units=metric`
      )
        .then((response) => response.json())
        .then((data) => {
          if(data.message)
          setCity({location: data.message, status : true})
         else
         setCity({...city, status : false})
          setIsLocal(false);
          setWeatherData((prev) => ({ ...prev, weather: data }));
          setIsLoading(false);
          
        })
        .catch((error) => {
          console.error(error);
        });
    }
    if (displayLocation.length < 3) {
      setIsLocal(true);
      setWeatherData((prev) => ({ ...prev, weather: {} }));
      setError("");
      return;
    }
    handleChange();
  }, [displayLocation]);

  const handleSuccess = async (position) => {
    const { latitude, longitude } = position.coords;
    setPosition({ latitude, longitude });
    setIsLoading(true);
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${KEY}`
    );
    const result = await response.json();
    setWeatherData((prev) => ({
      ...prev,
      displayLocation: city,
      localWeather: result,
    }));
    setIsLoading(false);
  };

  const handleError = (error) => {
    setError(error);
  };

  const handleClick = () => {
    setMoreInfo((prev) => !prev);
  };

  return (
    <div className="app">
      <div className="input-container">
        {!isLoading ? (
          <>
            <Input
              location={displayLocation}
              setDisplayLocation={setDisplayLocation}
            />
            <Weather
              weather={
                isLocal && weatherData
                  ? weatherData.localWeather
                  : weatherData.weather
              }
              location={displayLocation}
              city={city}
              isLocal={isLocal}
              setDisplayLocation={setDisplayLocation}
            />
          </>
        ) : (
          <p>Loading ...</p>
        )}
      </div>
     
      {
        !isLoading &&
      <>
        <button
        onClick={() =>
          handleClick(isLocal ? weatherData.weather : weatherData.localWeather)
        }
        disabled={city.status}
      >
        More Info
      </button>
      </>
      }
     
     
      {moreInfo &&  (
        <MoreInfo
          weather={
            isLocal && weatherData
              ? weatherData.localWeather
              : weatherData.weather
          }
          setMoreInfo={setMoreInfo}
        />
      )}
    </div>
  );
}

function Input({ location, setDisplayLocation }) {
  return (
    <input
      type="text"
      placeholder="Enter City Name"
      onChange={(e) => setDisplayLocation(e.target.value)}
      value={location}
    />
  );
}

function Weather({ weather, city }) {
  const { temp, temp_min, temp_max } =
    weather && weather.main ? weather.main : "No Weather found";
  const place = weather.name && weather.name ? weather.name : city.location;
  const { lat, lon } = weather && weather.coord ? weather.coord : "";
  const { description, icon, main } =
    weather && weather.weather ? weather.weather[0] : "Weather info not found";
  const iconUrl = icon ?
    `http://openweathermap.org/img/wn/${icon}@2x.png`
    : noweather

  return (
    <div>
      <h2>{place}</h2>
      <ul className="weather">
        {
          <li className="day">
            <p>
              <img src={iconUrl}/>
            </p>
            <span>{temp || 0}&deg;</span>
            <p>
              {Math.floor(temp_min) || 0}&deg; &mdash;{" "}
              <strong>{Math.ceil(temp_max) || 0}&deg;</strong>
            </p>
            <span>{description}</span>
            <small className="geocode">
              {lat && "latitude:"}-{lat}
              {lon && "longitude:"}-{lon}
            </small>
          </li>
        }
      </ul>
    </div>
  );
}

function MoreInfo({ setMoreInfo, weather }) {
  const convertUnix = (unixTime) => {
    return new Date(unixTime * 1000).toLocaleTimeString();
  };
  return (
    <div className="moreinfo">
      <div className="top">
        <p>More information</p>
        <span className="close" onClick={() => setMoreInfo((prev) => !prev)}>
          X
        </span>
      </div>

      <ul className="content">
        {
          <>
            <li>Country Code:- {convertToFlag(weather.sys.country)}</li>
            <li>Sunrise:- {convertUnix(weather.sys.sunrise)}</li>
            <li>Sunset:- {convertUnix(weather.sys.sunset)}</li>
            <li>Wind Speed:- {weather.wind.speed}</li>
            <li>Wind Degree:- {weather.wind.deg}</li>
            <li>Wind gust:- {weather.wind.gust}</li>
            <li>Sea Level:- {weather.main.sea_level}</li>
          </>
        }
      </ul>
    </div>
  );
}
