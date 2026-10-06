import React, { createContext, useState } from 'react';

export const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [passengers, setPassengers] = useState([]);
  const [bookingConfirmation, setBookingConfirmation] = useState(null);

  const resetBookingFlow = () => {
    setSelectedSchedule(null);
    setSelectedSeats([]);
    setPassengers([]);
    setBookingConfirmation(null);
  };

  const selectSeatToggle = (seatNumber) => {
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatNumber));
    } else {
      setSelectedSeats([...selectedSeats, seatNumber]);
    }
  };

  return (
    <BookingContext.Provider
      value={{
        selectedSchedule,
        setSelectedSchedule,
        selectedSeats,
        setSelectedSeats,
        selectSeatToggle,
        passengers,
        setPassengers,
        bookingConfirmation,
        setBookingConfirmation,
        resetBookingFlow
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};
