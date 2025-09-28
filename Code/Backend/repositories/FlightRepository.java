package com.example.lowflightzone.repositories;

import com.example.lowflightzone.entity.Flight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FlightRepository extends JpaRepository<Flight, Integer> {

    Optional<Flight> findByFlightNumber(String flightNumber);

    boolean existsByFlightNumber(String flightNumber);

    List<Flight> findByFlightNumberContainingIgnoreCaseOrDepartureAirport_CityContainingIgnoreCaseOrArrivalAirport_CityContainingIgnoreCaseOrDepartureAirport_IataCodeContainingIgnoreCaseOrArrivalAirport_IataCodeContainingIgnoreCaseOrDepartureAirport_NameContainingIgnoreCaseOrArrivalAirport_NameContainingIgnoreCase(
            String flightNumber,
            String depCity,
            String arrCity,
            String depIata,
            String arrIata,
            String depName,
            String arrName
    );
}
