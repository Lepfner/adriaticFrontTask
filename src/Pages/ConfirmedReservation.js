import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function ConfirmedReservation() {
  const location = useLocation();
  const navigate = useNavigate();

  const { name, startDate, endDate, numberOfPersons, totalPrice } =
    location.state;

  return (
    <div className="app">
      <h1>You have successfully booked accommodation {name}!</h1>
      <p>
        Stay duration: {startDate} - {endDate}
      </p>
      <p>Number of guests: {numberOfPersons}</p>
      <p>Total price: {totalPrice}</p>
      <button className="btn" onClick={() => navigate("/")}>
        Back
      </button>
    </div>
  );
}
