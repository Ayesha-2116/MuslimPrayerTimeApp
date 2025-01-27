import React, { useState } from "react";

const PrayerTimes = () => {
  const [location, setLocation] = useState(""); // User's input for location
  const [prayerTimes, setPrayerTimes] = useState(null); // Stores prayer times
  const [error, setError] = useState(""); // Error message
  const [loading, setLoading] = useState(false); // Loading state

  // Function to fetch prayer times from the API
  const fetchPrayerTimes = async () => {
    setLoading(true);
    setPrayerTimes(null);
    setError("");

    try {
        const response = await fetch(
            `https://muslimsalat.com/${location}.json?key=80e8bde95285b9ffab0dd193d93a75bc`
        );

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      if (data.status_code === 1) {
        setPrayerTimes(data); // Update prayer times if successful
      } else {
        throw new Error("Invalid location or data unavailable.");
      }
    } catch (err) {
      setError("Failed to fetch prayer times. Please check the location.");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (location.trim()) {
      fetchPrayerTimes();
    } else {
      setError("Please enter a valid location."); // Validation for empty input
    }
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
      <h1 style={{ textAlign: "center" }}>Prayer Times</h1>

      {/* Location Input Form */}
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}
      >
        <input
          type="text"
          placeholder="Enter location (e.g., Windsor)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          style={{
            padding: "10px",
            width: "300px",
            fontSize: "16px",
            marginRight: "10px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            color: "#fff",
            backgroundColor: "#007BFF",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Get Prayer Times
        </button>
      </form>

      {/* Error Message */}
      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      {/* Loading State */}
      {loading && <p style={{ textAlign: "center" }}>Loading...</p>}

      {/* Prayer Times Data */}
      {prayerTimes && (
        <div style={{ textAlign: "center" }}>
          <h2>Prayer Times for {prayerTimes.title}</h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {prayerTimes.items.map((item, index) => (
              <li
                key={index}
                style={{
                  marginBottom: "20px",
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  display: "inline-block",
                  textAlign: "left",
                  backgroundColor: "#f9f9f9",
                }}
              >
                <strong>Date:</strong> {item.date_for}
                <ul style={{ paddingLeft: "20px", marginTop: "10px" }}>
                  <li>Fajr: {item.fajr}</li>
                  <li>Shurooq: {item.shurooq}</li>
                  <li>Dhuhr: {item.dhuhr}</li>
                  <li>Asr: {item.asr}</li>
                  <li>Maghrib: {item.maghrib}</li>
                  <li>Isha: {item.isha}</li>
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PrayerTimes;
