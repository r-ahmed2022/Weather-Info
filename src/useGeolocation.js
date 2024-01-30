import { useState } from 'react'


export function useGeolocation() {
    const [position, setPosition] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    
    const [error, setError] = useState(null);

    function getPosition() {
        if (!navigator.geolocation)
        return setError("Your browser does not support geolocation");
        setIsLoading(true);
        navigator.geolocation.getCurrentPosition((pos) => {
            setPosition({
                lat: pos.coords.latitude,
                lon: pos.coords.longitude
            })
            setIsLoading(false)
        },
        (error) => {
          setError(error.message);
          setIsLoading(false);
        })
    } 

    return {isLoading, position, error, getPosition}
}
