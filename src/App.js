import React from "react";
import "./App.css";
import AccommodationList from "./Pages/AccomodationList";
import ConfirmedReservation from "./Pages/ConfirmedReservation";
import { Route, Routes } from "react-router-dom";

function App() {
  return (
    <Routes>
      <Route path="/" element={<AccommodationList />} />
      <Route path="/confirm" element={<ConfirmedReservation />} />
    </Routes>
  );
}

export default App;
