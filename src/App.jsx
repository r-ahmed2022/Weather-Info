/* eslint-disable no-undef */
/* eslint-disable react/prop-types */
import React from 'react'



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
export default class App extends React.Component {
  
    state ={
      location: '',
      isLoading: false,
      displayLocation: "",
      weather: {},
    }
     getWeather =   async () => {
    const {location} = this.state
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${location}`)
      const data = await res.json();
      this.setState({isLoading: true})
      if(!res.ok) throw new Error("location not found")
      const { latitude, longitude, timezone, name, country_code } =
      data.results.at(0);
      this.setState({displayLocation: `${name} ${convertToFlag(country_code)}`,
     })
      console.log(country_code)
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=${timezone}&daily=weathercode,temperature_2m_max,temperature_2m_min`
      );
      const weatherResult = await response.json()
      this.setState({weather: weatherResult.daily  })
      console.log(weatherResult)
    }catch(err) {
      console.log(err)
    } finally {
      this.setState({isLoading: true})
       
    }
    
   }

   handleChange = (e) => {
    this.setState({
      location: e.target.value
    })
   }
  render() {
    return (
      <div className="app">
        <input type="text" name="location" onChange={this.handleChange} value={this.state.location}
        placeholder='Enter the location name' />
        <button onClick={this.getWeather}>Search Weather</button>
        <Weather location={this.state.displayLocation}
        weather={this.state.weather} />
      </div>
    )
  }

}

class Weather extends React.Component {
  render() {
    const {
      temperature_2m_max: max,
      temperature_2m_min: min,
      time: dates,
      weathercode: codes, 
    } = this.props.weather
    return (
      <div>
      <h2>{this.props.location}</h2>
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
}

class Day extends React.Component {
  render() {
    const {date, min, max, code, isToday} = this.props
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
}





