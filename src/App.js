import React, { useState, useEffect } from "react";
import $ from "jquery";
import "./index.css";

function App() {
  const [location, setLocation] = useState("");
  const [prayerTimes, setPrayerTimes] = useState([]);
  const [dayDetails, setDayDetails] = useState({ day: "", date: "" });
  const [sunriseTime, setSunriseTime] = useState("");
  const [error, setError] = useState("");
  const [highlightedPrayer, setHighlightedPrayer] = useState("");
  const [locationSubmitted, setLocationSubmitted] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [timezoneOffset, setTimezoneOffset] = useState(0);

  useEffect(() => {
    const currentDate = new Date();
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    setDayDetails({
      day: dayNames[currentDate.getDay()],
      date: `${currentDate.getDate()} ${
        monthNames[currentDate.getMonth()]
      } ${currentDate.getFullYear()}`,
    });
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const utcTime = now.getTime() + now.getTimezoneOffset() * 60000; // Convert to UTC
      const localTime = new Date(utcTime + timezoneOffset * 3600000); // Adjust for timezone offset

      const hours = localTime.getHours();
      const minutes = localTime.getMinutes();
      const seconds = localTime.getSeconds();
      const ampm = hours >= 12 ? "PM" : "AM";
      const formattedTime = `${hours % 12 || 12}:${String(minutes).padStart(2, "0")}:${String(
        seconds
      ).padStart(2, "0")} ${ampm}`;
      setCurrentTime(formattedTime);
    };

    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [timezoneOffset]);

  const fetchPrayerTimes = (location) => {
    const API_KEY = "80e8bde95285b9ffab0dd193d93a75bc";
    const url = `https://muslimsalat.com/${location}/daily.json?key=${API_KEY}&jsoncallback=?`;

    $.getJSON(url, (response) => {
      if (response.status_valid === 1) {
        const times = response.items[0];
        setPrayerTimes([
          { name: "Fajr", time: times.fajr },
          { name: "Dhuhr", time: times.dhuhr },
          { name: "Asr", time: times.asr },
          { name: "Maghrib", time: times.maghrib },
          { name: "Isha", time: times.isha },
        ]);
        setSunriseTime(times.shurooq);
        setTimezoneOffset(parseFloat(response.timezone)); // Set timezone offset from API response
        setError("");
      } else {
        setError("Invalid location. Please try again.");
        setPrayerTimes([]);
        setSunriseTime("");
      }
    }).fail(() => {
      setError("Failed to fetch prayer times. Please check your connection.");
    });
  };

  const handleLocationSubmit = (e) => {
    e.preventDefault();
    if (location.trim() !== "") {
      fetchPrayerTimes(location.trim());
      setLocationSubmitted(true);
    }
  };

  useEffect(() => {
    const highlightPrayer = () => {
      if (prayerTimes.length > 0) {
        const now = new Date();
        const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
        const localTime = new Date(utcTime + timezoneOffset * 3600000);

        for (let i = 0; i < prayerTimes.length; i++) {
          const [time, period] = prayerTimes[i].time.split(" ");
          let [hour, minute] = time.split(":").map(Number);
          if (period.toUpperCase() === "PM" && hour < 12) hour += 12;
          if (period.toUpperCase() === "AM" && hour === 12) hour = 0;

          const prayerDate = new Date(
            localTime.getFullYear(),
            localTime.getMonth(),
            localTime.getDate(),
            hour,
            minute
          );

          if (localTime < prayerDate) {
            setHighlightedPrayer(prayerTimes[i].name);
            return;
          }
        }

        // Highlight the first prayer if the current time is after the last prayer
        setHighlightedPrayer(prayerTimes[0].name);
      }
    };

    highlightPrayer();
    const interval = setInterval(highlightPrayer, 60000);
    return () => clearInterval(interval);
  }, [prayerTimes, timezoneOffset]);

  return (
    <div className="app">
      {!locationSubmitted ? (
        <form className="location-form" onSubmit={handleLocationSubmit}>
          <input
            type="text"
            placeholder="Enter your location (e.g., Mumbai)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <button type="submit">Get Prayer Times</button>
        </form>
      ) : (
        <div className="small-icon" onClick={() => setLocationSubmitted(false)}>
          📍 {location}
        </div>
      )}

      {locationSubmitted && (
        <div className="container">
          <div className="leftside">
            <div className="prayertimetoday">
              {prayerTimes.length > 0 ? (
                prayerTimes.map((prayer, index) => (
                  <div
                    key={index}
                    className={`prayer ${
                      highlightedPrayer === prayer.name ? "highlighted" : ""
                    }`}
                  >
                    <p>{prayer.time}</p>
                    <p>{prayer.name}</p>
                  </div>
                ))
              ) : (
                <p>No prayer times available.</p>
              )}
            </div>
          </div>
          <div className="rightside">
            <div className="dateday">
              <p><strong>{dayDetails.day}</strong></p>
              <p><strong>{dayDetails.date}</strong></p>
            </div>
            <div className="current-time">{currentTime}</div>
            <div className="sunrisetimetoday">
              <p>{sunriseTime || "N/A"}</p>
              <p>Sunrise Timing</p>
            </div>
          </div>
        </div>
      )}

      {error && <div className="error">{error}</div>}
    </div>
  );
}

export default App;
