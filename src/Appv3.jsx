/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable react/prop-types */
import {useState, useEffect} from 'react'

function getWeatherIcon(wmoCode) {
  const icons = new Map([
    [[0], "☀️"],
    [[1], "🌤"],
    [[2], "⛅️"],
    [[3], "☁️"],
    [[45, 48], "🌫"],
    [[51, 56, 61, 66, 80], "🌦"],
    [[53, 55, 63, 65, 57, 67, 81, 82], "🌧"],
    [[71, 73, 75, 77, 85, 86], "🌨"],
    [[95], "🌩"],
    [[96, 99], "⛈"],
  ]);
  const arr = [...icons.keys()].find((key) => key.includes(wmoCode));
  if (!arr) return "NOT FOUND";
  return icons.get(arr);
}


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
export default function Appv3() {
    const [ isLocal, setIsLocal] = useState(true)
    const [position, setPosition] = useState({});
    const [error, setError] = useState(null);
    const [city, setCity] = useState('');
    const [weatherData, setWeatherData] = useState({
        displayLocation: "",
        localWeather: {},
        tempWeather: {},
        weather: {},
      })

         useEffect(function () {

          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              handleSuccess, 
              handleError
            );
          } else {
            setError(new Error('Geolocation is not supported.'));
          }
      }, [])

      const handleSuccess = async (position) => {
        const { latitude, longitude } = position.coords;
        setPosition({ latitude, longitude });
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min`)
        const result =  await response.json()
        getLocalCity(latitude, longitude)
        setWeatherData((prev)=> ({...prev, displayLocation: city, localWeather: result.daily}))

        };
    
        async function getLocalCity(latitude, longitude) {
         await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`)
         .then(response => response.json())
         .then(data=> {
           if(data && data.city) {
             const cityName = data.city
             setCity(cityName);
           } else {
             setCity('City not found');
           }
         });
         }
      const handleError = (error) => {
        setError(error);
      };
           
       async function fetchWeather(weather) {
        const { latitude, longitude, timezone, name, country_code } = weather
        console.log(country_code)
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=${timezone}&daily=weathercode,temperature_2m_max,temperature_2m_min`)
        const result =  await response.json()
          setWeatherData((prev)=> ({...prev,weather: result.daily}))
        }
      

        async function handleChange(e) {
          e.stopPropagation();
           const cityName = e.target.value;
            if(cityName === '') {
               setIsLocal(true)
               setWeatherData((prev) => ({
                 ...prev,
                 displayLocation: '',
               }));
               return
            }
            else {
            setWeatherData(prev => ({ ...prev, displayLocation: cityName }))
            await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${cityName}`)
              .then(response => response.json())
              .then(data => {
                setIsLocal(false)
                const weatherResult = data.results.at(0)
                setWeatherData((prev) => ({...prev, tempWeather:weatherResult }))
                if(!weatherResult) return
                else {
                  fetchWeather(weatherResult)
                }
              })
              .catch(error => {
                console.error('Error fetching weather data:', error);
               
              }) 
            }
            }        
    return (
    <div className="app">
     <div className="input-container">
       <Input handleChange={handleChange} location={weatherData.displayLocation}
       
        />
      <Weather 
        weather={isLocal && weatherData
        ? weatherData.localWeather
        : weatherData.weather
         }
         location={weatherData.displayLocation}
         city={city}
         isLocal={isLocal}
         />
    </div>
    <button onClick={fetchWeather}>Get 3 day weather</button>
    </div>
  )
}

function Input({location, handleChange}) {
    return (
            <input type="text" placeholder="Enter City Name" onChange={handleChange}
            value={location} />
     )
}

function Weather({weather, location, isLocal, city}) {
  const {
    temperature_2m_max: max,
    temperature_2m_min: min,
    time: dates,
    weathercode: codes, 
  } = weather
  return (
    <div>
    <h2>{isLocal ? city :location }</h2>
    <ul className="weather">
      {
         dates?.map((date, i) => (
           <Day key={date} 
           date={date} 
           max={max.at(i)}
           min={min.at(i)}
           code={codes.at(i)}
           isToday={i === 0}
           />
         ))
      }
    </ul>
    </div>
  )
}

function Day({date, min, max, code, isToday}) {
  return (
    <li className="day">
       <span>{getWeatherIcon(code)}</span>
       {isToday ? "Today" : formatDay(date)}
       <p>
       {Math.floor(min)}&deg; &mdash; <strong>{Math.ceil(max)}&deg;</strong>
       </p>
    </li>
  )
}