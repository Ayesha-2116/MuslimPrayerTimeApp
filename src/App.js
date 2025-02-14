import React, { useState, useEffect } from "react";
import $ from "jquery";
import "./index.css";

function App() {
  const [location, setLocation] = useState(""); // User-input location
  const [prayerTimes, setPrayerTimes] = useState([]);
  const [dayDetails, setDayDetails] = useState({
    day: "",
    date: "",
  });
  const [sunriseTime, setSunriseTime] = useState("");
  const [error, setError] = useState("");
  const [highlightedPrayer, setHighlightedPrayer] = useState(""); // Highlight the next prayer
  const [locationSubmitted, setLocationSubmitted] = useState(false); // Track location submission
  const [currentTime, setCurrentTime] = useState(""); // For the live clock

  // Get system's current date
  useEffect(() => {
    const currentDate = new Date();
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    setDayDetails({
      day: dayNames[currentDate.getDay()],
      date: `${currentDate.getDate()} ${
        monthNames[currentDate.getMonth()]
      } ${currentDate.getFullYear()}`,
    });
  }, []);

  // Update the current time in 12-hour format every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12; // Convert to 12-hour format
      const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")} ${ampm}`;
      setCurrentTime(formattedTime);
    };

    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval); // Cleanup
  }, []);

  // Fetch prayer times when location changes
  const fetchPrayerTimes = (location) => {
    const API_KEY = "80e8bde95285b9ffab0dd193d93a75bc"; // Replace with your API key
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
      setLocationSubmitted(true); // Mark location as submitted
    }
  };

  // Highlight upcoming prayer time
  useEffect(() => {
    const interval = setInterval(() => {
      if (prayerTimes.length > 0) {
        const now = new Date();

        for (let i = 0; i < prayerTimes.length; i++) {
          const prayerTime = prayerTimes[i];

          // Parse the time properly to handle AM/PM
          const timeParts = prayerTime.time.match(/(\d+):(\d+)\s?(AM|PM)/i);
          if (!timeParts) continue; // Skip invalid times

          let hour = parseInt(timeParts[1], 10);
          const minute = parseInt(timeParts[2], 10);
          const period = timeParts[3].toUpperCase();

          // Convert to 24-hour format
          if (period === "PM" && hour < 12) hour += 12;
          if (period === "AM" && hour === 12) hour = 0;

          const prayerDateTime = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            hour,
            minute
          );

          if (now < prayerDateTime) {
            setHighlightedPrayer(prayerTime.name);
            break;
          } else if (i === prayerTimes.length - 1) {
            setHighlightedPrayer(prayerTimes[0].name);
          }
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [prayerTimes]);

  return (
    <div className="app">
      {/* Form for location input */}
      {!locationSubmitted && (
        <form className="location-form" onSubmit={handleLocationSubmit}>
          <input
            type="text"
            placeholder="Enter your location (e.g., Windsor)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <button type="submit">Get Prayer Times</button>
        </form>
      )}

      {locationSubmitted && (
        <div className="small-icon" onClick={() => setLocationSubmitted(false)}>
          📍 {location}
        </div>
      )}

      {locationSubmitted && (
          <div className="container">
          {/* Left Side */}
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
        
          {/* Right Side */}
          <div className="rightside">
            <div className="current-time">{currentTime}</div> {/* Display current time */}
            <div className="dateday">
              <p><strong>{dayDetails.day}</strong></p>
              <p><strong>{dayDetails.date}</strong></p>
            </div>
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
