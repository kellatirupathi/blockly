import React, { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow, Polyline } from '@react-google-maps/api';
import axios from 'axios';
import './App.css';

const mapContainerStyle = {
  width: '100vw',
  height: '100vh'
};

const center = {
  lat: 17.385044,
  lng: 78.486671
};

const App = () => {
  const [vehiclePath, setVehiclePath] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(center);
  const [mapCenter, setMapCenter] = useState(center);
  const [startLocation, setStartLocation] = useState(null);
  const [endLocation, setEndLocation] = useState(null);
  const [selectedDate, setSelectedDate] = useState('today');
  const [showInfoWindow, setShowInfoWindow] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [playbackInterval, setPlaybackInterval] = useState(null);
  const [markerRotation, setMarkerRotation] = useState(0);
  const [showPlaybackControls, setShowPlaybackControls] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/vehicle-location', {
          params: { date: selectedDate }
        });
        const data = response.data;

        if (Array.isArray(data) && data.length > 0) {
          const formattedPath = data.map(coord => ({ lat: coord.latitude, lng: coord.longitude }));
          setVehiclePath(formattedPath);
          setStartLocation(formattedPath[0]);
          setEndLocation(formattedPath[formattedPath.length - 1]);
          setCurrentLocation(formattedPath[0]);
          setMapCenter(formattedPath[0]); // Set the initial map center
        } else {
          setVehiclePath([]);
          setCurrentLocation(center);
          setStartLocation(null);
          setEndLocation(null);
          setMapCenter(center); // Reset the map center if no data
        }
      } catch (error) {
        console.error('Error fetching vehicle location:', error);
      }
    };

    fetchData();
  }, [selectedDate]);

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const toggleInfoWindow = () => {
    setShowInfoWindow(!showInfoWindow);
  };

  const handlePlaybackSpeedChange = (event) => {
    setPlaybackSpeed(Number(event.target.value));
  };

  const calculateAngle = (point1, point2) => {
    const dy = point2.lat - point1.lat;
    const dx = point2.lng - point1.lng;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    return angle;
  };

  const startPlayback = () => {
    if (playbackInterval) {
      clearInterval(playbackInterval);
    }

    let index = 0;
    const interval = setInterval(() => {
      if (index < vehiclePath.length - 1) {
        setCurrentLocation(vehiclePath[index]);
        const angle = calculateAngle(vehiclePath[index], vehiclePath[index + 1]);
        setMarkerRotation(angle);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 1000 / playbackSpeed);

    setPlaybackInterval(interval);
  };

  return (
    <LoadScript
      googleMapsApiKey="AIzaSyB2YGKBYF225rnp93MJmeoGfmHmLHa6n4U"
      onLoad={() => setIsLoaded(true)}
      onError={() => console.error('Error loading Google Maps API')}
    >
      {isLoaded && (
        <div style={{ position: 'relative' }}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={8}
            center={mapCenter} // Use mapCenter to keep it fixed
          >
            {startLocation && (
              <Marker
                position={startLocation}
                icon={{
                  url: "http://maps.google.com/mapfiles/kml/paddle/go.png",
                  scaledSize: new window.google.maps.Size(50, 50)
                }}
              />
            )}
            {endLocation && (
              <Marker
                position={endLocation}
                icon={{
                  url: "http://maps.google.com/mapfiles/kml/paddle/stop.png",
                  scaledSize: new window.google.maps.Size(50, 50)
                }}
              />
            )}
            {vehiclePath.length > 0 && (
              <>
                <Polyline
                  path={vehiclePath}
                  options={{ strokeColor: '#558052', strokeWeight: 5 }}
                />
                <Marker
                  position={currentLocation}
                  icon={{
                    url: "https://img.icons8.com/?size=100&id=b6Yx1jSCrEyb&format=png&color=000000",
                    scaledSize: new window.google.maps.Size(50, 50),
                    rotation: markerRotation // Rotate marker as per angle
                  }}
                />
              </>
            )}
            {showInfoWindow && (
              <InfoWindow
                position={currentLocation}
                onCloseClick={toggleInfoWindow}
              >
                <div className="info-window-content">
                  <h2>WIRELESS</h2>
                  <p>A/23/28, Vijay Nagar Rd, Vijay Nagar, Delhi</p>
                  <p>Jul 20, 07:09 AM</p>
                  <div className="info-window-details">
                    <div>
                      <p>Speed: 0.00 km/h</p>
                      <p>Distance: 0.00 km</p>
                      <p>Total Distance: 834.89 km</p>
                      <p>Battery: 16%</p>
                    </div>
                    <div>
                      <p>Current Status: STOPPED</p>
                      <p>Today Running: 00h:00m</p>
                      <p>Today Stopped: 07h:10m</p>
                      <p>Today Idle: 00h:00m</p>
                    </div>
                    <div>
                      <p>Max Speed: 0.00 km/h</p>
                      <p>Ignition On: 00h:00m</p>
                      <p>Ignition Off: 00h:00m</p>
                      <p>AC On: 00h:00m</p>
                      <p>AC Off: 00h:00m</p>
                    </div>
                  </div>
                  <div className="info-window-footer">
                    <button className="icon-btn">Icon 1</button>
                    <button className="icon-btn">Icon 2</button>
                    <button className="icon-btn">Icon 3</button>
                    <button className="icon-btn">Icon 4</button>
                  </div>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
          {!showPlaybackControls ? (
            <div className="control-panel">
              <select value={selectedDate} onChange={handleDateChange} id="one">
                <option value="wireless">WIRELESS</option>
                <option value="wired">WIRED</option>
              </select>
              <select value={selectedDate} onChange={handleDateChange} id="two">
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="this_week">This Week</option>
                <option value="previous_week">Previous Week</option>
                <option value="this_month">This Month</option>
                <option value="previous_month">Previous Month</option>
                <option value="custom">Custom</option>
              </select>
              <button onClick={() => setShowPlaybackControls(true)} id="three">SHOW</button>
            </div>
          ) : (
            <div className="playback-controls">
              <label htmlFor="playbackSpeed" id="four">Speed:</label>
              <input
                id="playbackSpeed"
                type="range"
                min="1"
                max="5"
                value={playbackSpeed}
                onChange={handlePlaybackSpeedChange}
              />
              <button onClick={startPlayback} id="five">PLAY</button>
            </div>
          )}
        </div>
      )}
    </LoadScript>
  );
};

export default App;
