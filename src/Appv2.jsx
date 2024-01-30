/* eslint-disable react/prop-types */
import {useState, useEffect} from 'react'
import { useGeolocation } from './useGeolocation';
function formatDay(dateStr) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
  }).format(new Date(dateStr));
}
const KEY = 'cf6967fd1784732aebe4bdb9186f3879'
export default function Appv2() {
    const [ isLocal, setIsLocal] = useState(true)
    const [weatherData, setWeatherData] = useState({
        displayLocation: "",
        localWeather: {},
        weather: {},
      })
         const {isLoading, position: {lat, lon}, getPosition} = useGeolocation()
    
         useEffect(function () {
          if(!isLoading) {
              getPosition()
            }
          async function fetchLocalWeather() {
          const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${KEY}`)
          const result = await response.json()
          setWeatherData((prev)=> ({...prev, localWeather: result}))
          console.log(result)
        }
        
        fetchLocalWeather()
        return () => {console.log("cleaning") };
      }, [isLoading, lat, lon])

   
      async function fetchWeather() {
        const {displayLocation} = weatherData
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${displayLocation}&appid=${KEY}&units=metric`)
          const result = await response.json()
          console.log(result)
        }
      

        function handleChange(e) {
            const city = e.target.value;
          
            setWeatherData(prev => ({ ...prev, displayLocation: e.target.value}));
          
            fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${KEY}&units=metric`)
              .then(response => response.json())
              .then(result => {
                setWeatherData(prev => ({ ...prev, weather: result }));
                setIsLocal(false)
              })
              .catch(error => {
                console.error('Error fetching weather data:', error);
               
              }) 
            }        
    return (
    <div className="app">
     <div className="input-container">
       <Input handleChange={handleChange} location={weatherData.displayLocation}
       
        />
      <Weather 
        weather={isLocal
        ? weatherData.localWeather
        : weatherData.weather
         }/>
    </div>
    <button onClick={fetchWeather}>Get 5 day weather</button>
    </div>
  )
}

function Input({location, handleChange}) {
    return (
            <input type="text" placeholder="Enter City Name" onChange={handleChange}
            value={location} />
     )
}

function Weather({weather}) {
  const { temp, temp_min, temp_max } = weather && weather.main ? weather.main : 'Temp unknown';
  console.log(weather)
  const place = weather.name;
  const { icon } = weather && weather.weather && weather.weather[0] ? weather.weather[0] : 'defaultIcon';
  const iconUrl = `http://openweathermap.org/img/wn/${icon}@2x.png`;

  return (
    
    <div>
      <ul className='weather'>
     <li className="day">
       <span>{place}</span>
       <p><img src={iconUrl} /></p>
       <span>
        {temp}
       </span>
       <small>Min: {temp_min}&deg;&mdash;
       Max:- {temp_max}&deg;</small>
      
 
     </li>
      </ul>
      
    </div>
  )
}

function Day() {
  return (
    <li></li>
  )
}