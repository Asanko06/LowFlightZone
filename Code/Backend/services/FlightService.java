package com.example.lowflightzone.services;

import com.example.lowflightzone.dao.AirportDao;
import com.example.lowflightzone.dao.FlightDao;
import com.example.lowflightzone.dto.AirportDto;
import com.example.lowflightzone.dto.FlightDto;
import com.example.lowflightzone.entity.Airport;
import com.example.lowflightzone.entity.Flight;
import com.example.lowflightzone.entity.FlightSubscription;
import com.example.lowflightzone.exceptions.AirportException;
import com.example.lowflightzone.exceptions.FlightException;
import com.example.lowflightzone.exceptions.ValidationException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
public class FlightService {

    private static final String FLIGHT_NOT_FOUND_MESSAGE = "Рейс не найден: ";
    private static final String FLIGHT_ALREADY_EXISTS_MESSAGE = "Рейс с таким номером уже существует: ";

    private final FlightDao flightDao;
    private final AirportDao airportDao;

    @Autowired
    public FlightService(FlightDao flightDao, AirportDao airportDao) {
        this.flightDao = flightDao;
        this.airportDao = airportDao;
    }

    public List<FlightDto> getFlights(String departureAirport, String arrivalAirport, String status) {
        List<FlightDto> flights = flightDao.findAll().stream()
                .filter(flight -> departureAirport == null ||
                        flight.getDepartureAirport().getIataCode().equals(departureAirport))
                .filter(flight -> arrivalAirport == null ||
                        flight.getArrivalAirport().getIataCode().equals(arrivalAirport))
                .filter(flight -> status == null || flight.getStatus().toString().equals(status))
                .map(this::convertToDto)
                .collect(Collectors.toList());

        if (flights.isEmpty()) {
            throw new FlightException("Рейсы с такими параметрами не найдены");
        }
        return flights;
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

        // Обновляем аэропорты через их коды
        if (updatedFlightDto.getDepartureAirport() != null) {
            Airport departureAirport = airportDao.findByIataCode(updatedFlightDto.getDepartureAirport().getIataCode())
                    .orElseThrow(() -> new AirportException("Аэропорт вылета не найден"));
            flight.setDepartureAirport(departureAirport);
        }

        if (updatedFlightDto.getArrivalAirport() != null) {
            Airport arrivalAirport = airportDao.findByIataCode(updatedFlightDto.getArrivalAirport().getIataCode())
                    .orElseThrow(() -> new AirportException("Аэропорт прибытия не найден"));
            flight.setArrivalAirport(arrivalAirport);
        }

        flight.setFlightNumber(updatedFlightDto.getFlightNumber());
        flight.setAirline(updatedFlightDto.getAirline());
        flight.setScheduledDeparture(updatedFlightDto.getScheduledDeparture());
        flight.setStatus(Flight.FlightStatus.valueOf(updatedFlightDto.getStatus()));
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
            Airport departureAirport = airportDao.findByIataCode(partialFlightDto.getDepartureAirport().getIataCode())
                    .orElseThrow(() -> new AirportException("Аэропорт вылета не найден"));
            flight.setDepartureAirport(departureAirport);
        }
        if (partialFlightDto.getArrivalAirport() != null) {
            Airport arrivalAirport = airportDao.findByIataCode(partialFlightDto.getArrivalAirport().getIataCode())
                    .orElseThrow(() -> new AirportException("Аэропорт прибытия не найден"));
            flight.setArrivalAirport(arrivalAirport);
        }
        if (partialFlightDto.getScheduledDeparture() != null) {
            flight.setScheduledDeparture(partialFlightDto.getScheduledDeparture());
        }
        if (partialFlightDto.getStatus() != null) {
            flight.setStatus(Flight.FlightStatus.valueOf(partialFlightDto.getStatus()));
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
        if (flightDto.getDepartureAirport() == null || flightDto.getDepartureAirport().getIataCode() == null) {
            throw new ValidationException("Аэропорт вылета не может быть пустым");
        }
        if (flightDto.getArrivalAirport() == null || flightDto.getArrivalAirport().getIataCode() == null) {
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

        // ✈️ Конвертируем Airport entity в AirportDto
        if (flight.getDepartureAirport() != null) {
            AirportDto departureDto = new AirportDto();
            departureDto.setIataCode(flight.getDepartureAirport().getIataCode());
            departureDto.setName(flight.getDepartureAirport().getName());
            departureDto.setCity(flight.getDepartureAirport().getCity());
            departureDto.setCountry(flight.getDepartureAirport().getCountry());
            flightDto.setDepartureAirport(departureDto);
        }

        if (flight.getArrivalAirport() != null) {
            AirportDto arrivalDto = new AirportDto();
            arrivalDto.setIataCode(flight.getArrivalAirport().getIataCode());
            arrivalDto.setName(flight.getArrivalAirport().getName());
            arrivalDto.setCity(flight.getArrivalAirport().getCity());
            arrivalDto.setCountry(flight.getArrivalAirport().getCountry());
            flightDto.setArrivalAirport(arrivalDto);
        }

        flightDto.setScheduledDeparture(flight.getScheduledDeparture());
        flightDto.setScheduledArrival(flight.getScheduledArrival());
        flightDto.setEstimatedDeparture(flight.getEstimatedDeparture());
        flightDto.setEstimatedArrival(flight.getEstimatedArrival());
        flightDto.setActualDeparture(flight.getActualDeparture());
        flightDto.setActualArrival(flight.getActualArrival());
        flightDto.setStatus(flight.getStatus() != null ? flight.getStatus().toString() : null);
        flightDto.setDelayMinutes(flight.getDelayMinutes());
        flightDto.setTerminal(flight.getTerminal());
        flightDto.setGate(flight.getGate());
        flightDto.setLastUpdated(flight.getLastUpdated());

        // ✅ Считаем только активные подписки
        if (flight.getSubscriptions() != null) {
            long activeSubscriptions = flight.getSubscriptions().stream()
                    .filter(sub -> sub.getStatus() == FlightSubscription.SubscriptionStatus.ACTIVE)
                    .count();
            flightDto.setSubscriptionCount((int) activeSubscriptions);
        } else {
            flightDto.setSubscriptionCount(0);
        }

        return flightDto;
    }

    @Transactional
    public FlightDto getFlightById(Integer id) {
        Flight flight = flightDao.findById(id)
                .orElseThrow(() -> new FlightException(FLIGHT_NOT_FOUND_MESSAGE + id));

        // Записываем просмотр для текущего пользователя
        try {
            viewHistoryService.recordFlightView(id);
        } catch (Exception e) {
            // Логируем ошибку, но не прерываем выполнение
            log.warn("Failed to record flight view for flight {}", id, e);
        }

        return convertToDto(flight);
    }

    @Autowired
    private FlightViewHistoryService viewHistoryService;

    public FlightDto getFlightById(Integer id, Integer userId) {
        Flight flight = flightDao.findById(id)
                .orElseThrow(() -> new FlightException(FLIGHT_NOT_FOUND_MESSAGE + id));

        // Записываем просмотр
        if (userId != null) {
            try {
                viewHistoryService.recordFlightView(userId, id);
            } catch (Exception e) {
                // Логируем ошибку, но не прерываем выполнение
                log.warn("Failed to record flight view for user {} and flight {}", userId, id, e);
            }
        }

        return convertToDto(flight);
    }

    private Flight convertToEntity(FlightDto flightDto) {
        Flight flight = new Flight();
        flight.setId(flightDto.getId());
        flight.setFlightNumber(flightDto.getFlightNumber());
        flight.setAirline(flightDto.getAirline());

        // Находим аэропорты по их кодам
        if (flightDto.getDepartureAirport() != null) {
            Airport departureAirport = airportDao.findByIataCode(flightDto.getDepartureAirport().getIataCode())
                    .orElseThrow(() -> new AirportException("Аэропорт вылета не найден: " + flightDto.getDepartureAirport().getIataCode()));
            flight.setDepartureAirport(departureAirport);
        }

        if (flightDto.getArrivalAirport() != null) {
            Airport arrivalAirport = airportDao.findByIataCode(flightDto.getArrivalAirport().getIataCode())
                    .orElseThrow(() -> new AirportException("Аэропорт прибытия не найден: " + flightDto.getArrivalAirport().getIataCode()));
            flight.setArrivalAirport(arrivalAirport);
        }

        flight.setScheduledDeparture(flightDto.getScheduledDeparture());
        flight.setScheduledArrival(flightDto.getScheduledArrival());
        flight.setEstimatedDeparture(flightDto.getEstimatedDeparture());
        flight.setEstimatedArrival(flightDto.getEstimatedArrival());
        flight.setActualDeparture(flightDto.getActualDeparture());
        flight.setActualArrival(flightDto.getActualArrival());

        if (flightDto.getStatus() != null) {
            flight.setStatus(Flight.FlightStatus.valueOf(flightDto.getStatus()));
        }

        flight.setDelayMinutes(flightDto.getDelayMinutes());
        flight.setTerminal(flightDto.getTerminal());
        flight.setGate(flightDto.getGate());
        return flight;
    }
}