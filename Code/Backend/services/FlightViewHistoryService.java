package com.example.lowflightzone.services;

import com.example.lowflightzone.dao.FlightDao;
import com.example.lowflightzone.dao.FlightViewHistoryDao;
import com.example.lowflightzone.dao.UserDao;
import com.example.lowflightzone.dto.FlightViewHistoryDto;
import com.example.lowflightzone.entity.Flight;
import com.example.lowflightzone.entity.FlightViewHistory;
import com.example.lowflightzone.entity.User;
import com.example.lowflightzone.exceptions.FlightException;
import com.example.lowflightzone.exceptions.UserException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FlightViewHistoryService {

    private final FlightViewHistoryDao viewHistoryDao;
    private final UserDao userDao;
    private final FlightDao flightDao;

    @Autowired
    public FlightViewHistoryService(FlightViewHistoryDao viewHistoryDao, UserDao userDao, FlightDao flightDao) {
        this.viewHistoryDao = viewHistoryDao;
        this.userDao = userDao;
        this.flightDao = flightDao;
    }

    @Transactional
    public FlightViewHistoryDto recordFlightView(Integer userId, Integer flightId) {
        User user = userDao.findById(userId)
                .orElseThrow(() -> new UserException("User not found: " + userId));

        Flight flight = flightDao.findById(flightId)
                .orElseThrow(() -> new FlightException("Flight not found: " + flightId));

        // Проверяем, есть ли уже запись
        Optional<FlightViewHistory> existingView = viewHistoryDao.findByUserIdAndFlightId(userId, flightId);

        FlightViewHistory viewHistory;
        if (existingView.isPresent()) {
            // Обновляем существующую запись
            viewHistory = existingView.get();
            viewHistory.setViewCount(viewHistory.getViewCount() + 1);
            viewHistory.setViewedAt(LocalDateTime.now());
        } else {
            // Создаем новую запись
            viewHistory = new FlightViewHistory();
            viewHistory.setUser(user);
            viewHistory.setFlight(flight);
            viewHistory.setViewedAt(LocalDateTime.now());
            viewHistory.setViewCount(1);
        }

        FlightViewHistory savedView = viewHistoryDao.saveOrUpdateView(viewHistory);
        return convertToDto(savedView);
    }

    public List<FlightViewHistoryDto> getRecentViews(Integer userId, int limit) {
        return viewHistoryDao.getRecentViewsByUserId(userId, limit).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<FlightViewHistoryDto> getMostViewedFlights(Integer userId, int limit) {
        return viewHistoryDao.getMostViewedByUserId(userId, limit).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<FlightViewHistoryDto> getUserViewHistory(Integer userId) {
        return viewHistoryDao.getUserViewHistory(userId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public Integer getFlightViewCount(Integer userId, Integer flightId) {
        return viewHistoryDao.getViewCount(userId, flightId);
    }

    @Transactional
    public void clearUserHistory(Integer userId) {
        List<FlightViewHistory> userHistory = viewHistoryDao.getUserViewHistory(userId);
        userHistory.forEach(history -> viewHistoryDao.deleteViewHistory(history.getId()));
    }

    @Transactional
    public void removeFlightFromHistory(Integer userId, Integer flightId) {
        viewHistoryDao.deleteByUserAndFlight(userId, flightId);
    }

    private FlightViewHistoryDto convertToDto(FlightViewHistory viewHistory) {
        FlightViewHistoryDto dto = new FlightViewHistoryDto();
        dto.setId(viewHistory.getId());
        dto.setViewedAt(viewHistory.getViewedAt());
        dto.setViewCount(viewHistory.getViewCount());
        return dto;
    }
}