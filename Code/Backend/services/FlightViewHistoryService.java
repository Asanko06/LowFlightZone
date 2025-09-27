package com.example.lowflightzone.services;

import com.example.lowflightzone.dao.FlightDao;
import com.example.lowflightzone.dao.FlightViewHistoryDao;
import com.example.lowflightzone.dao.UserDao;
import com.example.lowflightzone.dto.AirportDto;
import com.example.lowflightzone.dto.FlightDto;
import com.example.lowflightzone.dto.FlightViewHistoryDto;
import com.example.lowflightzone.entity.Flight;
import com.example.lowflightzone.entity.FlightViewHistory;
import com.example.lowflightzone.entity.User;
import com.example.lowflightzone.exceptions.FlightException;
import com.example.lowflightzone.exceptions.UserException;
import com.example.lowflightzone.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class FlightViewHistoryService {

    private final FlightViewHistoryDao viewHistoryDao;
    private final UserDao userDao;
    private final FlightDao flightDao;
    private final SecurityUtils securityUtils;

    @Transactional
    public FlightViewHistoryDto recordFlightView(Integer flightId) {
        Integer userId = securityUtils.getCurrentUserIdOrThrow();

        User user = userDao.findById(userId)
                .orElseThrow(() -> new UserException("User not found: " + userId));

        Flight flight = flightDao.findById(flightId)
                .orElseThrow(() -> new FlightException("Flight not found: " + flightId));

        return recordFlightView(user, flight);
    }

    @Transactional
    public FlightViewHistoryDto recordFlightView(Integer userId, Integer flightId) {
        User user = userDao.findById(userId)
                .orElseThrow(() -> new UserException("User not found: " + userId));

        Flight flight = flightDao.findById(flightId)
                .orElseThrow(() -> new FlightException("Flight not found: " + flightId));

        return recordFlightView(user, flight);
    }

    private FlightViewHistoryDto recordFlightView(User user, Flight flight) {
        Optional<FlightViewHistory> existingView =
                viewHistoryDao.findByUserIdAndFlightId(user.getId(), flight.getId());

        FlightViewHistory view = existingView.orElseGet(FlightViewHistory::new);
        view.setUser(user);
        view.setFlight(flight);
        view.setViewedAt(LocalDateTime.now());
        view.setViewCount(existingView.map(v -> v.getViewCount() + 1).orElse(1));

        return convertToDto(viewHistoryDao.saveOrUpdateView(view));
    }

    public List<FlightViewHistoryDto> getCurrentUserRecentViews(int limit) {
        Integer userId = securityUtils.getCurrentUserIdOrThrow();
        return viewHistoryDao.getRecentViewsByUserId(userId, limit).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<FlightViewHistoryDto> getRecentViews(Integer userId, int limit) {
        return viewHistoryDao.getRecentViewsByUserId(userId, limit).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<FlightViewHistoryDto> getCurrentUserViewHistory() {
        Integer userId = securityUtils.getCurrentUserIdOrThrow();
        return viewHistoryDao.getUserViewHistory(userId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void clearCurrentUserHistory() {
        Integer userId = securityUtils.getCurrentUserIdOrThrow();
        viewHistoryDao.getUserViewHistory(userId)
                .forEach(h -> viewHistoryDao.deleteViewHistory(h.getId()));
    }

    // полное заполнение DTO — включая аэропорты
    private FlightViewHistoryDto convertToDto(FlightViewHistory vh) {
        FlightViewHistoryDto dto = new FlightViewHistoryDto();
        dto.setId(vh.getId());
        dto.setViewedAt(vh.getViewedAt());
        dto.setViewCount(vh.getViewCount());

        Flight f = vh.getFlight();
        if (f != null) {
            FlightDto fd = new FlightDto();
            fd.setId(f.getId());
            fd.setFlightNumber(f.getFlightNumber());
            fd.setAirline(f.getAirline());
            fd.setScheduledDeparture(f.getScheduledDeparture());
            fd.setScheduledArrival(f.getScheduledArrival());
            fd.setEstimatedDeparture(f.getEstimatedDeparture());
            fd.setEstimatedArrival(f.getEstimatedArrival());
            fd.setActualDeparture(f.getActualDeparture());
            fd.setActualArrival(f.getActualArrival());
            fd.setStatus(f.getStatus() != null ? f.getStatus().name() : null);

            if (f.getDepartureAirport() != null) {
                AirportDto dep = new AirportDto();
                dep.setIataCode(f.getDepartureAirport().getIataCode());
                dep.setName(f.getDepartureAirport().getName());
                dep.setCity(f.getDepartureAirport().getCity());
                dep.setCountry(f.getDepartureAirport().getCountry());
                fd.setDepartureAirport(dep);
            }
            if (f.getArrivalAirport() != null) {
                AirportDto arr = new AirportDto();
                arr.setIataCode(f.getArrivalAirport().getIataCode());
                arr.setName(f.getArrivalAirport().getName());
                arr.setCity(f.getArrivalAirport().getCity());
                arr.setCountry(f.getArrivalAirport().getCountry());
                fd.setArrivalAirport(arr);
            }

            dto.setFlight(fd);
        }

        return dto;
    }
}
