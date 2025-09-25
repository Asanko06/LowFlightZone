package com.example.lowflightzone.repositories;

import com.example.lowflightzone.entity.Flight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface FlightRepository extends JpaRepository<Flight, Integer> {
    Optional<Flight> findByFlightNumber(String flightNumber);
    List<Flight> findByDepartureAirport(String departureAirport);
    List<Flight> findByArrivalAirport(String arrivalAirport);
    List<Flight> findByStatus(String status);
    boolean existsByFlightNumber(String flightNumber);
}