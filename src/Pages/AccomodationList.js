import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function AccommodationList() {
  const [accommodations, setAccommodations] = useState([]);
  const [filteredAccommodations, setFilteredAccommodations] = useState([]);
  const [selectedAccommodation, setSelectedAccommodation] = useState(null);
  const [numberOfPersons, setNumberOfPersons] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchAccommodations();
  }, []);

  const fetchAccommodations = async () => {
    try {
      const response = await fetch(
        "https://api.adriatic.hr/test/accommodation"
      );
      const data = await response.json();
      setAccommodations(data);
      setFilteredAccommodations(data);
    } catch (error) {
      console.error("Error fetching accommodations:", error);
    }
  };

  const handleFilter = () => {
    const filtered = accommodations.filter((accommodation) => {
      const availableDates = accommodation.availableDates.some(
        (date) =>
          new Date(date.intervalStart) <= new Date(startDate) &&
          new Date(date.intervalEnd) >= new Date(endDate)
      );
      return (
        (!startDate || !endDate || availableDates) &&
        accommodation.capacity >= numberOfPersons
      );
    });
    setFilteredAccommodations(filtered);
  };

  const handleReserve = () => {
    const totalPrice = calculateTotalPrice();
    const accommodationName = selectedAccommodation
      ? selectedAccommodation.title
      : "Unknown Accommodation";

    navigate("/confirm", {
      state: {
        startDate,
        endDate,
        numberOfPersons,
        accommodationName,
        totalPrice,
      },
    });

    setSelectedAccommodation(null);
  };

  const handleStartDateChange = (e) => {
    const selectedDate = new Date(e.target.value);
    setStartDate(selectedDate.toISOString().split("T")[0]);
    if (!endDate || selectedDate >= new Date(endDate)) {
      setEndDate(
        new Date(selectedDate.getTime() + 86400000).toISOString().split("T")[0]
      );
    }
  };

  const handleEndDateChange = (e) => {
    const selectedDate = new Date(e.target.value);
    setEndDate(selectedDate.toISOString().split("T")[0]);
  };

  const calculateTotalPrice = () => {
    let totalPrice = 0;
    filteredAccommodations.forEach((accommodation) => {
      if (
        selectedAccommodation === accommodation &&
        startDate &&
        endDate &&
        accommodation.pricelistInEuros
      ) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        accommodation.pricelistInEuros.forEach((priceInterval) => {
          const intervalStart = new Date(priceInterval.intervalStart);
          const intervalEnd = new Date(priceInterval.intervalEnd);
          if (start < intervalEnd && end > intervalStart) {
            const overlappingStart =
              start < intervalStart ? intervalStart : start;
            const overlappingEnd = end < intervalEnd ? end : intervalEnd;
            const overlappingDifference =
              (overlappingEnd - overlappingStart) / (1000 * 3600 * 24);
            const nightsWithinInterval = Math.max(0, overlappingDifference);
            const intervalPrice =
              nightsWithinInterval * priceInterval.pricePerNight;
            totalPrice += intervalPrice;
          }
        });
      }
    });
    return totalPrice;
  };

  return (
    <div className="app">
      <h1>Accommodations</h1>
      <div className="filter">
        <label>
          Start Date:
          <input
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
            min="2024-01-01"
            max="2024-12-31"
          />
        </label>
        <label>
          End Date:
          <input
            type="date"
            value={endDate}
            onChange={handleEndDateChange}
            min={
              startDate
                ? new Date(startDate).toISOString().split("T")[0]
                : "2024-01-02"
            }
            max="2024-12-31"
          />
        </label>
        <label>
          Number of Persons:
          <input
            type="number"
            min="1"
            value={numberOfPersons}
            onChange={(e) => setNumberOfPersons(e.target.value)}
          />
        </label>
        <button className="btn" onClick={handleFilter}>
          Filter
        </button>
      </div>
      <div>
        {filteredAccommodations.map((accommodation) => (
          <div key={accommodation.id}>
            <img src={accommodation.image} alt={accommodation.title} />
            <h2>{accommodation.title}</h2>
            <p>Capacity: {accommodation.capacity}</p>
            {accommodation.beachDistanceInMeters && (
              <p>
                Beach Distance: {accommodation.beachDistanceInMeters} meters
              </p>
            )}
            <button
              className="btn"
              onClick={() =>
                setSelectedAccommodation((prevAccommodation) =>
                  prevAccommodation === accommodation ? null : accommodation
                )
              }
            >
              {selectedAccommodation === accommodation
                ? "Hide Details"
                : "Show Details"}
            </button>
            {selectedAccommodation === accommodation && (
              <div>
                <div className="details">
                  <div className="amenities">
                    <h3>
                      <b>Amenities</b>
                    </h3>
                    <ul>
                      {Object.entries(accommodation.amenities).map(
                        ([key, value]) => (
                          <li key={key}>
                            {key}: {value ? "Yes" : "No"}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                  <div>
                    <h3>
                      <b>Pricelist</b>
                    </h3>
                    <ul>
                      {accommodation.pricelistInEuros.map(
                        (priceInterval, index) => (
                          <li key={index}>
                            {priceInterval.intervalStart} -{" "}
                            {priceInterval.intervalEnd}:{" "}
                            {priceInterval.pricePerNight} Euros
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
                {startDate && endDate ? (
                  <div>
                    <p>Total Price: {calculateTotalPrice()} Euros</p>
                    <button className="btn" onClick={handleReserve}>
                      Reserve
                    </button>
                  </div>
                ) : (
                  <p>
                    Please select dates to see exact price and reserve the
                    accommodation.
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default AccommodationList;
