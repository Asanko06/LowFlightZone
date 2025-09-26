package com.example.lowflightzone.repositories;

import com.example.lowflightzone.entity.Flight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface FlightRepository extends JpaRepository<Flight, Integer> {
    Optional<Flight> findByFlightNumber(String flightNumber);

    // Исправляем тип параметра
    List<Flight> findByStatus(Flight.FlightStatus status);

    // Добавляем метод для поиска по строковому статусу
    @Query("SELECT f FROM Flight f WHERE f.status = :status")
    List<Flight> findByStatusString(@Param("status") String status);

    List<Flight> findByDepartureAirport_IataCode(String airportCode);
    List<Flight> findByArrivalAirport_IataCode(String airportCode);

    @Query("SELECT f FROM Flight f WHERE f.scheduledDeparture BETWEEN :start AND :end")
    List<Flight> findFlightsByDateRange(@Param("start") LocalDateTime start,
                                        @Param("end") LocalDateTime end);

    @Query("SELECT f FROM Flight f WHERE f.lastUpdated < :threshold")
    List<Flight> findStaleFlights(@Param("threshold") LocalDateTime threshold);

    boolean existsByFlightNumber(String flightNumber);
}