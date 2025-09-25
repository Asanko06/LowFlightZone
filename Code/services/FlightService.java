package com.example.lowflightzone.services;

import com.example.lowflightzone.dao.FlightDao;
import com.example.lowflightzone.dto.FlightDto;
import com.example.lowflightzone.entity.Flight;
import com.example.lowflightzone.exceptions.FlightException;
import com.example.lowflightzone.exceptions.ValidationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FlightService {

    private static final String FLIGHT_NOT_FOUND_MESSAGE = "Рейс не найден: ";
    private static final String FLIGHT_ALREADY_EXISTS_MESSAGE = "Рейс с таким номером уже существует: ";

    private final FlightDao flightDao;

    @Autowired
    public FlightService(FlightDao flightDao) {
        this.flightDao = flightDao;
    }

    public List<FlightDto> getFlights(String departureAirport, String arrivalAirport, String status) {
        List<FlightDto> flights = flightDao.findAll().stream()
                .filter(flight -> departureAirport == null ||
                        flight.getDepartureAirport().equalsIgnoreCase(departureAirport))
                .filter(flight -> arrivalAirport == null ||
                        flight.getArrivalAirport().equalsIgnoreCase(arrivalAirport))
                .filter(flight -> status == null || flight.getStatus().equalsIgnoreCase(status))
                .map(this::convertToDto)
                .collect(Collectors.toList());

        if (flights.isEmpty()) {
            throw new FlightException("Рейсы с такими параметрами не найдены");
        }
        return flights;
    }

    public FlightDto getFlightById(Integer id) {
        Flight flight = flightDao.findById(id)
                .orElseThrow(() -> new FlightException(FLIGHT_NOT_FOUND_MESSAGE + id));
        return convertToDto(flight);
    }

    public FlightDto getFlightByNumber(String flightNumber) {
        Flight flight = flightDao.findByFlightNumber(flightNumber)
                .orElseThrow(() -> new FlightException(FLIGHT_NOT_FOUND_MESSAGE + flightNumber));
        return convertToDto(flight);
    }

    public FlightDto addFlight(FlightDto flightDto) {
        validateFlightDto(flightDto);

        if (flightDao.existsByFlightNumber(flightDto.getFlightNumber())) {
            throw new FlightException(FLIGHT_ALREADY_EXISTS_MESSAGE + flightDto.getFlightNumber());
        }

        Flight flight = convertToEntity(flightDto);
        Flight savedFlight = flightDao.save(flight);

        return convertToDto(savedFlight);
    }

    public void deleteFlightById(Integer id) {
        flightDao.findById(id)
                .orElseThrow(() -> new FlightException(FLIGHT_NOT_FOUND_MESSAGE + id));

        flightDao.deleteById(id);
    }

    public FlightDto updateFlight(Integer id, FlightDto updatedFlightDto) {
        validateFlightDto(updatedFlightDto);

        Flight flight = flightDao.findById(id)
                .orElseThrow(() -> new FlightException(FLIGHT_NOT_FOUND_MESSAGE + id));

        flight.setFlightNumber(updatedFlightDto.getFlightNumber());
        flight.setAirline(updatedFlightDto.getAirline());
        flight.setDepartureAirport(updatedFlightDto.getDepartureAirport());
        flight.setArrivalAirport(updatedFlightDto.getArrivalAirport());
        flight.setScheduledDeparture(updatedFlightDto.getScheduledDeparture());
        flight.setStatus(updatedFlightDto.getStatus());
        flight.setDelayMinutes(updatedFlightDto.getDelayMinutes());

        Flight updatedFlight = flightDao.save(flight);
        return convertToDto(updatedFlight);
    }

    public FlightDto patchFlight(Integer id, FlightDto partialFlightDto) {
        Flight flight = flightDao.findById(id)
                .orElseThrow(() -> new FlightException(FLIGHT_NOT_FOUND_MESSAGE + id));

        if (partialFlightDto.getFlightNumber() != null) {
            flight.setFlightNumber(partialFlightDto.getFlightNumber());
        }
        if (partialFlightDto.getAirline() != null) {
            flight.setAirline(partialFlightDto.getAirline());
        }
        if (partialFlightDto.getDepartureAirport() != null) {
            flight.setDepartureAirport(partialFlightDto.getDepartureAirport());
        }
        if (partialFlightDto.getArrivalAirport() != null) {
            flight.setArrivalAirport(partialFlightDto.getArrivalAirport());
        }
        if (partialFlightDto.getScheduledDeparture() != null) {
            flight.setScheduledDeparture(partialFlightDto.getScheduledDeparture());
        }
        if (partialFlightDto.getStatus() != null) {
            flight.setStatus(partialFlightDto.getStatus());
        }
        if (partialFlightDto.getDelayMinutes() != null) {
            flight.setDelayMinutes(partialFlightDto.getDelayMinutes());
        }

        Flight updatedFlight = flightDao.save(flight);
        return convertToDto(updatedFlight);
    }

    private void validateFlightDto(FlightDto flightDto) {
        if (flightDto.getFlightNumber() == null || flightDto.getFlightNumber().trim().isEmpty()) {
            throw new ValidationException("Номер рейса не может быть пустым");
        }
        if (flightDto.getAirline() == null || flightDto.getAirline().trim().isEmpty()) {
            throw new ValidationException("Авиакомпания не может быть пустой");
        }
        if (flightDto.getDepartureAirport() == null || flightDto.getDepartureAirport().trim().isEmpty()) {
            throw new ValidationException("Аэропорт вылета не может быть пустым");
        }
        if (flightDto.getArrivalAirport() == null || flightDto.getArrivalAirport().trim().isEmpty()) {
            throw new ValidationException("Аэропорт прибытия не может быть пустым");
        }
        if (flightDto.getScheduledDeparture() == null) {
            throw new ValidationException("Время вылета не может быть пустым");
        }
    }

    private FlightDto convertToDto(Flight flight) {
        FlightDto flightDto = new FlightDto();
        flightDto.setId(flight.getId());
        flightDto.setFlightNumber(flight.getFlightNumber());
        flightDto.setAirline(flight.getAirline());
        flightDto.setDepartureAirport(flight.getDepartureAirport());
        flightDto.setArrivalAirport(flight.getArrivalAirport());
        flightDto.setScheduledDeparture(flight.getScheduledDeparture());
        flightDto.setStatus(flight.getStatus());
        flightDto.setDelayMinutes(flight.getDelayMinutes());
        flightDto.setCreatedAt(flight.getCreatedAt());
        return flightDto;
    }

    private Flight convertToEntity(FlightDto flightDto) {
        Flight flight = new Flight();
        flight.setId(flightDto.getId());
        flight.setFlightNumber(flightDto.getFlightNumber());
        flight.setAirline(flightDto.getAirline());
        flight.setDepartureAirport(flightDto.getDepartureAirport());
        flight.setArrivalAirport(flightDto.getArrivalAirport());
        flight.setScheduledDeparture(flightDto.getScheduledDeparture());
        flight.setStatus(flightDto.getStatus());
        flight.setDelayMinutes(flightDto.getDelayMinutes());
        return flight;
    }
}