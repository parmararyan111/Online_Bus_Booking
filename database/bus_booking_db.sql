-- Online Bus Booking System Database Schema
-- Database: bus_booking_db

CREATE DATABASE IF NOT EXISTS `bus_booking_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `bus_booking_db`;

-- --------------------------------------------------------
-- Table structure for `users`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `reviews`;
DROP TABLE IF EXISTS `payments`;
DROP TABLE IF EXISTS `booking_passengers`;
DROP TABLE IF EXISTS `bookings`;
DROP TABLE IF EXISTS `schedules`;
DROP TABLE IF EXISTS `routes`;
DROP TABLE IF EXISTS `bus_seats`;
DROP TABLE IF EXISTS `buses`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `phone` VARCHAR(20) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
  `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for `buses`
-- --------------------------------------------------------
CREATE TABLE `buses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `bus_number` VARCHAR(50) NOT NULL UNIQUE,
  `bus_name` VARCHAR(100) NOT NULL,
  `operator_name` VARCHAR(100) NOT NULL,
  `bus_type` ENUM('AC Seater', 'Non-AC Seater', 'AC Sleeper', 'Non-AC Sleeper', 'Volvo AC', 'Volvo Sleeper') NOT NULL,
  `total_seats` INT NOT NULL DEFAULT 30,
  `amenities` TEXT,
  `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for `bus_seats`
-- --------------------------------------------------------
CREATE TABLE `bus_seats` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `bus_id` INT NOT NULL,
  `seat_number` VARCHAR(10) NOT NULL,
  `seat_type` ENUM('SEATER', 'SLEEPER') NOT NULL DEFAULT 'SEATER',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_bus_seat` (`bus_id`, `seat_number`),
  CONSTRAINT `fk_seats_bus` FOREIGN KEY (`bus_id`) REFERENCES `buses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for `routes`
-- --------------------------------------------------------
CREATE TABLE `routes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `source` VARCHAR(100) NOT NULL,
  `destination` VARCHAR(100) NOT NULL,
  `distance_km` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_route` (`source`, `destination`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for `schedules`
-- --------------------------------------------------------
CREATE TABLE `schedules` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `bus_id` INT NOT NULL,
  `route_id` INT NOT NULL,
  `travel_date` DATE NOT NULL,
  `departure_time` TIME NOT NULL,
  `arrival_time` TIME NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `status` ENUM('ACTIVE', 'CANCELLED') NOT NULL DEFAULT 'ACTIVE',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_schedules_bus` FOREIGN KEY (`bus_id`) REFERENCES `buses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_schedules_route` FOREIGN KEY (`route_id`) REFERENCES `routes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for `bookings`
-- --------------------------------------------------------
CREATE TABLE `bookings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `booking_reference` VARCHAR(50) NOT NULL UNIQUE,
  `user_id` INT NOT NULL,
  `schedule_id` INT NOT NULL,
  `total_seats` INT NOT NULL,
  `total_amount` DECIMAL(10, 2) NOT NULL,
  `booking_status` ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED') NOT NULL DEFAULT 'CONFIRMED',
  `booking_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `cancelled_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_bookings_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_bookings_schedule` FOREIGN KEY (`schedule_id`) REFERENCES `schedules` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for `booking_passengers`
-- --------------------------------------------------------
CREATE TABLE `booking_passengers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `booking_id` INT NOT NULL,
  `seat_number` VARCHAR(10) NOT NULL,
  `passenger_name` VARCHAR(100) NOT NULL,
  `age` INT NOT NULL,
  `gender` ENUM('Male', 'Female', 'Other') NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_passengers_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for `payments`
-- --------------------------------------------------------
CREATE TABLE `payments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `booking_id` INT NOT NULL,
  `transaction_id` VARCHAR(100) NOT NULL UNIQUE,
  `amount` DECIMAL(10, 2) NOT NULL,
  `payment_method` ENUM('UPI', 'Credit Card', 'Debit Card', 'Net Banking') NOT NULL,
  `payment_status` ENUM('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'SUCCESS',
  `payment_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_payments_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for `reviews`
-- --------------------------------------------------------
CREATE TABLE `reviews` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `bus_id` INT NOT NULL,
  `booking_id` INT NOT NULL,
  `rating` INT NOT NULL CHECK (`rating` BETWEEN 1 AND 5),
  `comment` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reviews_bus` FOREIGN KEY (`bus_id`) REFERENCES `buses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reviews_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- SAMPLE DATA INSERTION
-- --------------------------------------------------------

-- Insert Users (Passwords: user123 and admin123)
INSERT INTO `users` (`id`, `name`, `email`, `phone`, `password`, `role`, `status`) VALUES
(1, 'System Admin', 'admin@busbooking.com', '9876543210', '$2a$10$srfE1PM7tdwBAz0QPoXPE.aBGDb88V1KnDRXwGrxxvY5gOFr9OUmC', 'ADMIN', 'ACTIVE'),
(2, 'John Doe', 'user@example.com', '9876543211', '$2a$10$K7Mkb7oJbExVSrAXiMPIzufODj0GirYYdaf48.8NIrWeRzenkECQG', 'USER', 'ACTIVE'),
(3, 'Jane Smith', 'jane@example.com', '9876543212', '$2a$10$K7Mkb7oJbExVSrAXiMPIzufODj0GirYYdaf48.8NIrWeRzenkECQG', 'USER', 'ACTIVE'),
(4, 'Rahul Sharma', 'rahul@example.com', '9876543213', '$2a$10$K7Mkb7oJbExVSrAXiMPIzufODj0GirYYdaf48.8NIrWeRzenkECQG', 'USER', 'ACTIVE'),
(5, 'Priya Patel', 'priya@example.com', '9876543214', '$2a$10$K7Mkb7oJbExVSrAXiMPIzufODj0GirYYdaf48.8NIrWeRzenkECQG', 'USER', 'ACTIVE'),
(6, 'Amit Kumar', 'amit@example.com', '9876543215', '$2a$10$K7Mkb7oJbExVSrAXiMPIzufODj0GirYYdaf48.8NIrWeRzenkECQG', 'USER', 'ACTIVE');

-- Insert 10 Buses
INSERT INTO `buses` (`id`, `bus_number`, `bus_name`, `operator_name`, `bus_type`, `total_seats`, `amenities`, `status`) VALUES
(1, 'GJ-01-AB-1234', 'GSRTC Volvo Multi-Axle', 'GSRTC Express', 'Volvo AC', 30, 'WiFi, Charging Port, Water Bottle, Reclining Seats', 'ACTIVE'),
(2, 'GJ-18-XY-9876', 'Shreenath Travels Sleeper', 'Shreenath Express', 'Volvo Sleeper', 30, 'Pillow, Blanket, Charging Port, Reading Light', 'ACTIVE'),
(3, 'MH-04-AB-4321', 'Neeta Tours Multi-Axle', 'Neeta Travels', 'AC Sleeper', 30, 'WiFi, TV, Pillow, Water Bottle', 'ACTIVE'),
(4, 'DL-01-CD-5678', 'Patel Tours & Travels', 'Patel Travels', 'AC Seater', 30, 'Charging Port, Reclining Seats, Water Bottle', 'ACTIVE'),
(5, 'RJ-14-EF-9012', 'Rajasthan Royal Express', 'Royal Travels', 'Non-AC Sleeper', 30, 'Charging Port, Blanket', 'ACTIVE'),
(6, 'KA-01-GH-3456', 'KSRTC Airavat Gold Class', 'KSRTC', 'Volvo AC', 30, 'WiFi, Emergency Button, Water Bottle, TV', 'ACTIVE'),
(7, 'GJ-05-JK-7890', 'Eagle Connect Superfast', 'Eagle Travels', 'AC Seater', 30, 'Reclining Seats, Charging Port', 'ACTIVE'),
(8, 'MH-12-LM-2345', 'VRL Multi-Axle B11R', 'VRL Logistics', 'Volvo Sleeper', 30, 'Personal TV, WiFi, Blanket, Reading Light', 'ACTIVE'),
(9, 'DL-02-NP-6789', 'Zingbus Premium Coach', 'Zingbus', 'Volvo AC', 30, 'WiFi, Live Tracking, Water Bottle, Snacks', 'ACTIVE'),
(10, 'RJ-27-RS-1122', 'Shrinath Super Luxury', 'Shrinath Travels', 'Non-AC Seater', 30, 'Comfortable Seating, USB Charging', 'ACTIVE');

-- Insert 15 Routes
INSERT INTO `routes` (`id`, `source`, `destination`, `distance_km`) VALUES
(1, 'Ahmedabad', 'Mumbai', 530),
(2, 'Mumbai', 'Ahmedabad', 530),
(3, 'Ahmedabad', 'Surat', 260),
(4, 'Surat', 'Mumbai', 280),
(5, 'Mumbai', 'Pune', 150),
(6, 'Pune', 'Bangalore', 840),
(7, 'Ahmedabad', 'Rajkot', 215),
(8, 'Ahmedabad', 'Udaipur', 260),
(9, 'Udaipur', 'Jaipur', 390),
(10, 'Jaipur', 'Delhi', 280),
(11, 'Delhi', 'Jaipur', 280),
(12, 'Vadodara', 'Mumbai', 410),
(13, 'Ahmedabad', 'Vadodara', 110),
(14, 'Bangalore', 'Mumbai', 980),
(15, 'Surat', 'Ahmedabad', 260);

-- Insert 30 Schedules (Includes today and upcoming dates in Oct 2026 / dynamic dates)
INSERT INTO `schedules` (`id`, `bus_id`, `route_id`, `travel_date`, `departure_time`, `arrival_time`, `price`, `status`) VALUES
(1, 1, 1, '2026-10-15', '22:00:00', '06:30:00', 899.00, 'ACTIVE'),
(2, 2, 1, '2026-10-15', '23:15:00', '07:45:00', 1150.00, 'ACTIVE'),
(3, 3, 1, '2026-10-15', '21:30:00', '06:00:00', 1050.00, 'ACTIVE'),
(4, 4, 3, '2026-10-15', '06:00:00', '11:00:00', 450.00, 'ACTIVE'),
(5, 7, 3, '2026-10-15', '14:30:00', '19:15:00', 500.00, 'ACTIVE'),
(6, 1, 2, '2026-10-16', '21:00:00', '05:30:00', 920.00, 'ACTIVE'),
(7, 3, 5, '2026-10-15', '07:00:00', '10:30:00', 350.00, 'ACTIVE'),
(8, 8, 6, '2026-10-15', '18:00:00', '08:00:00', 1450.00, 'ACTIVE'),
(9, 5, 8, '2026-10-15', '22:30:00', '04:30:00', 600.00, 'ACTIVE'),
(10, 9, 10, '2026-10-15', '15:00:00', '20:30:00', 750.00, 'ACTIVE'),
(11, 10, 7, '2026-10-15', '08:00:00', '12:30:00', 320.00, 'ACTIVE'),
(12, 1, 1, '2026-10-16', '22:00:00', '06:30:00', 899.00, 'ACTIVE'),
(13, 2, 1, '2026-10-16', '23:15:00', '07:45:00', 1150.00, 'ACTIVE'),
(14, 6, 14, '2026-10-15', '16:00:00', '09:00:00', 1600.00, 'ACTIVE'),
(15, 4, 13, '2026-10-15', '09:00:00', '11:15:00', 200.00, 'ACTIVE'),
(16, 1, 1, '2026-10-04', '22:00:00', '06:30:00', 899.00, 'ACTIVE'),
(17, 2, 1, '2026-10-04', '23:00:00', '07:30:00', 1150.00, 'ACTIVE'),
(18, 3, 2, '2026-10-04', '20:00:00', '04:30:00', 1000.00, 'ACTIVE'),
(19, 4, 3, '2026-10-04', '15:00:00', '19:30:00', 450.00, 'ACTIVE'),
(20, 8, 6, '2026-10-04', '19:00:00', '09:00:00', 1450.00, 'ACTIVE'),
(21, 9, 11, '2026-10-15', '11:00:00', '16:30:00', 780.00, 'ACTIVE'),
(22, 5, 9, '2026-10-15', '21:00:00', '05:00:00', 550.00, 'ACTIVE'),
(23, 7, 15, '2026-10-15', '17:00:00', '21:30:00', 480.00, 'ACTIVE'),
(24, 1, 1, '2026-10-20', '22:00:00', '06:30:00', 899.00, 'ACTIVE'),
(25, 2, 1, '2026-10-20', '23:15:00', '07:45:00', 1150.00, 'ACTIVE'),
(26, 3, 5, '2026-10-16', '08:00:00', '11:30:00', 350.00, 'ACTIVE'),
(27, 4, 12, '2026-10-15', '23:00:00', '06:00:00', 750.00, 'ACTIVE'),
(28, 8, 1, '2026-10-15', '20:30:00', '05:00:00', 1200.00, 'ACTIVE'),
(29, 9, 10, '2026-10-16', '15:00:00', '20:30:00', 750.00, 'ACTIVE'),
(30, 6, 6, '2026-10-15', '17:30:00', '07:30:00', 1500.00, 'ACTIVE');

-- Insert seats for Bus 1 to 10 (30 seats each: A1-A10, B1-B10, C1-C10 / L1-L10, U1-U10)
-- Bus 1 Seats
INSERT INTO `bus_seats` (`bus_id`, `seat_number`, `seat_type`) VALUES
(1, 'A1', 'SEATER'), (1, 'A2', 'SEATER'), (1, 'A3', 'SEATER'), (1, 'A4', 'SEATER'), (1, 'A5', 'SEATER'),
(1, 'A6', 'SEATER'), (1, 'A7', 'SEATER'), (1, 'A8', 'SEATER'), (1, 'A9', 'SEATER'), (1, 'A10', 'SEATER'),
(1, 'B1', 'SEATER'), (1, 'B2', 'SEATER'), (1, 'B3', 'SEATER'), (1, 'B4', 'SEATER'), (1, 'B5', 'SEATER'),
(1, 'B6', 'SEATER'), (1, 'B7', 'SEATER'), (1, 'B8', 'SEATER'), (1, 'B9', 'SEATER'), (1, 'B10', 'SEATER'),
(1, 'C1', 'SEATER'), (1, 'C2', 'SEATER'), (1, 'C3', 'SEATER'), (1, 'C4', 'SEATER'), (1, 'C5', 'SEATER'),
(1, 'C6', 'SEATER'), (1, 'C7', 'SEATER'), (1, 'C8', 'SEATER'), (1, 'C9', 'SEATER'), (1, 'C10', 'SEATER');

-- Bus 2 Seats (Sleeper)
INSERT INTO `bus_seats` (`bus_id`, `seat_number`, `seat_type`) VALUES
(2, 'L1', 'SLEEPER'), (2, 'L2', 'SLEEPER'), (2, 'L3', 'SLEEPER'), (2, 'L4', 'SLEEPER'), (2, 'L5', 'SLEEPER'),
(2, 'L6', 'SLEEPER'), (2, 'L7', 'SLEEPER'), (2, 'L8', 'SLEEPER'), (2, 'L9', 'SLEEPER'), (2, 'L10', 'SLEEPER'),
(2, 'U1', 'SLEEPER'), (2, 'U2', 'SLEEPER'), (2, 'U3', 'SLEEPER'), (2, 'U4', 'SLEEPER'), (2, 'U5', 'SLEEPER'),
(2, 'U6', 'SLEEPER'), (2, 'U7', 'SLEEPER'), (2, 'U8', 'SLEEPER'), (2, 'U9', 'SLEEPER'), (2, 'U10', 'SLEEPER'),
(2, 'M1', 'SLEEPER'), (2, 'M2', 'SLEEPER'), (2, 'M3', 'SLEEPER'), (2, 'M4', 'SLEEPER'), (2, 'M5', 'SLEEPER'),
(2, 'M6', 'SLEEPER'), (2, 'M7', 'SLEEPER'), (2, 'M8', 'SLEEPER'), (2, 'M9', 'SLEEPER'), (2, 'M10', 'SLEEPER');

-- Bus 3 to 10 Seats helper loops (We will seed the rest dynamically or populate explicitly)
INSERT INTO `bus_seats` (`bus_id`, `seat_number`, `seat_type`) VALUES
(3, 'L1', 'SLEEPER'), (3, 'L2', 'SLEEPER'), (3, 'L3', 'SLEEPER'), (3, 'L4', 'SLEEPER'), (3, 'L5', 'SLEEPER'),
(3, 'U1', 'SLEEPER'), (3, 'U2', 'SLEEPER'), (3, 'U3', 'SLEEPER'), (3, 'U4', 'SLEEPER'), (3, 'U5', 'SLEEPER'),
(3, 'A1', 'SEATER'), (3, 'A2', 'SEATER'), (3, 'A3', 'SEATER'), (3, 'A4', 'SEATER'), (3, 'A5', 'SEATER'),
(3, 'B1', 'SEATER'), (3, 'B2', 'SEATER'), (3, 'B3', 'SEATER'), (3, 'B4', 'SEATER'), (3, 'B5', 'SEATER'),
(3, 'C1', 'SEATER'), (3, 'C2', 'SEATER'), (3, 'C3', 'SEATER'), (3, 'C4', 'SEATER'), (3, 'C5', 'SEATER'),
(3, 'D1', 'SEATER'), (3, 'D2', 'SEATER'), (3, 'D3', 'SEATER'), (3, 'D4', 'SEATER'), (3, 'D5', 'SEATER');

-- Additional seats for bus 4-10
INSERT INTO `bus_seats` (`bus_id`, `seat_number`, `seat_type`) VALUES
(4, 'A1', 'SEATER'), (4, 'A2', 'SEATER'), (4, 'A3', 'SEATER'), (4, 'B1', 'SEATER'), (4, 'B2', 'SEATER'), (4, 'B3', 'SEATER'), (4, 'C1', 'SEATER'), (4, 'C2', 'SEATER'), (4, 'C3', 'SEATER'), (4, 'D1', 'SEATER'),
(5, 'L1', 'SLEEPER'), (5, 'L2', 'SLEEPER'), (5, 'L3', 'SLEEPER'), (5, 'U1', 'SLEEPER'), (5, 'U2', 'SLEEPER'), (5, 'U3', 'SLEEPER'),
(6, 'A1', 'SEATER'), (6, 'A2', 'SEATER'), (6, 'A3', 'SEATER'), (6, 'B1', 'SEATER'), (6, 'B2', 'SEATER'), (6, 'B3', 'SEATER'),
(7, 'A1', 'SEATER'), (7, 'A2', 'SEATER'), (7, 'A3', 'SEATER'), (7, 'B1', 'SEATER'), (7, 'B2', 'SEATER'), (7, 'B3', 'SEATER'),
(8, 'L1', 'SLEEPER'), (8, 'L2', 'SLEEPER'), (8, 'L3', 'SLEEPER'), (8, 'U1', 'SLEEPER'), (8, 'U2', 'SLEEPER'), (8, 'U3', 'SLEEPER'),
(9, 'A1', 'SEATER'), (9, 'A2', 'SEATER'), (9, 'A3', 'SEATER'), (9, 'B1', 'SEATER'), (9, 'B2', 'SEATER'), (9, 'B3', 'SEATER'),
(10, 'A1', 'SEATER'), (10, 'A2', 'SEATER'), (10, 'A3', 'SEATER'), (10, 'B1', 'SEATER'), (10, 'B2', 'SEATER'), (10, 'B3', 'SEATER');

-- Insert Sample Bookings
INSERT INTO `bookings` (`id`, `booking_reference`, `user_id`, `schedule_id`, `total_seats`, `total_amount`, `booking_status`, `booking_date`) VALUES
(1, 'BUS20261001001', 2, 16, 2, 1798.00, 'COMPLETED', '2026-10-01 10:30:00'),
(2, 'BUS20261002002', 3, 17, 1, 1150.00, 'COMPLETED', '2026-10-02 14:15:00'),
(3, 'BUS20261003003', 4, 1, 2, 1798.00, 'CONFIRMED', '2026-10-03 16:45:00'),
(4, 'BUS20261004004', 5, 2, 1, 1150.00, 'CANCELLED', '2026-10-04 09:20:00');

-- Insert Passengers
INSERT INTO `booking_passengers` (`id`, `booking_id`, `seat_number`, `passenger_name`, `age`, `gender`) VALUES
(1, 1, 'A1', 'John Doe', 28, 'Male'),
(2, 1, 'A2', 'Sarah Doe', 26, 'Female'),
(3, 2, 'L1', 'Jane Smith', 32, 'Female'),
(4, 3, 'A3', 'Rahul Sharma', 30, 'Male'),
(5, 3, 'A4', 'Vikram Sharma', 25, 'Male'),
(6, 4, 'L2', 'Priya Patel', 27, 'Female');

-- Insert Payments
INSERT INTO `payments` (`id`, `booking_id`, `transaction_id`, `amount`, `payment_method`, `payment_status`, `payment_date`) VALUES
(1, 1, 'TXN98765432101', 1798.00, 'UPI', 'SUCCESS', '2026-10-01 10:31:12'),
(2, 2, 'TXN98765432102', 1150.00, 'Credit Card', 'SUCCESS', '2026-10-02 14:16:05'),
(3, 3, 'TXN98765432103', 1798.00, 'UPI', 'SUCCESS', '2026-10-03 16:46:10'),
(4, 4, 'TXN98765432104', 1150.00, 'Net Banking', 'REFUNDED', '2026-10-04 09:21:00');

-- Insert Reviews
INSERT INTO `reviews` (`id`, `user_id`, `bus_id`, `booking_id`, `rating`, `comment`, `created_at`) VALUES
(1, 2, 1, 1, 5, 'Extremely comfortable bus! Arrived right on time and driver was very courteous.', '2026-10-02 12:00:00'),
(2, 3, 2, 2, 4, 'Clean sleeper berths and provided fresh blankets. Good experience overall.', '2026-10-03 09:30:00');
