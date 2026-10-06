import React from 'react';
import { Armchair, Disc } from 'lucide-react';

const SeatLayout = ({ seats = [], selectedSeats = [], onSeatClick, busType = 'AC Seater' }) => {
  const isSleeper = busType.toLowerCase().includes('sleeper');

  return (
    <div className="bus-container">
      {/* Front Steering Wheel */}
      <div className="steering-wheel">
        <div className="d-flex align-items-center gap-2 text-muted small bg-light px-3 py-1 rounded-pill">
          <Disc size={18} className="text-secondary" /> Driver Cabin
        </div>
      </div>

      {/* Legend */}
      <div className="d-flex justify-content-around mb-4 small bg-light p-2 rounded-3 border">
        <div className="d-flex align-items-center gap-2">
          <div className="seat-btn available" style={{ width: '24px', height: '24px', fontSize: '10px' }}></div>
          <span>Available</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <div className="seat-btn selected" style={{ width: '24px', height: '24px', fontSize: '10px' }}></div>
          <span>Selected</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <div className="seat-btn booked" style={{ width: '24px', height: '24px', fontSize: '10px' }}></div>
          <span>Booked</span>
        </div>
      </div>

      {/* Seat Grid Layout */}
      <div className="row g-2 justify-content-center">
        {seats.map((seat) => {
          const isSelected = selectedSeats.includes(seat.seat_number);
          const isBooked = seat.status === 'BOOKED';

          let btnClass = 'seat-btn ';
          if (isBooked) {
            btnClass += 'booked';
          } else if (isSelected) {
            btnClass += 'selected';
          } else {
            btnClass += 'available';
          }

          return (
            <div key={seat.id || seat.seat_number} className={isSleeper ? 'col-4 mb-2' : 'col-3 mb-2'}>
              <button
                type="button"
                className={`${btnClass} ${isSleeper ? 'sleeper-berth w-100' : 'w-100'}`}
                disabled={isBooked}
                onClick={() => onSeatClick(seat.seat_number)}
                title={isBooked ? `Seat ${seat.seat_number} (Already Booked)` : `Seat ${seat.seat_number}`}
              >
                {seat.seat_number}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SeatLayout;
