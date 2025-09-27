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

    /**
     * Записать просмотр рейса для текущего пользователя
     */
    @Transactional
    public FlightViewHistoryDto recordFlightView(Integer flightId) {
        // Получаем ID текущего аутентифицированного пользователя
        Integer userId = securityUtils.getCurrentUserIdOrThrow();

        User user = userDao.findById(userId)
                .orElseThrow(() -> new UserException("User not found: " + userId));

        Flight flight = flightDao.findById(flightId)
                .orElseThrow(() -> new FlightException("Flight not found: " + flightId));

        return recordFlightView(user, flight);
    }

    /**
     * Записать просмотр рейса для конкретного пользователя (для админов)
     */
    @Transactional
    public FlightViewHistoryDto recordFlightView(Integer userId, Integer flightId) {
        User user = userDao.findById(userId)
                .orElseThrow(() -> new UserException("User not found: " + userId));

        Flight flight = flightDao.findById(flightId)
                .orElseThrow(() -> new FlightException("Flight not found: " + flightId));

        return recordFlightView(user, flight);
    }

    private FlightViewHistoryDto recordFlightView(User user, Flight flight) {
        log.info("Recording flight view - User: {}, Flight: {}", user.getId(), flight.getId());

        Optional<FlightViewHistory> existingView = viewHistoryDao.findByUserIdAndFlightId(user.getId(), flight.getId());

        FlightViewHistory viewHistory;
        if (existingView.isPresent()) {
            viewHistory = existingView.get();
            viewHistory.setViewCount(viewHistory.getViewCount() + 1);
            viewHistory.setViewedAt(LocalDateTime.now());
            log.debug("Updating existing view record. Count: {}", viewHistory.getViewCount());
        } else {
            viewHistory = new FlightViewHistory();
            viewHistory.setUser(user);
            viewHistory.setFlight(flight);
            viewHistory.setViewedAt(LocalDateTime.now());
            viewHistory.setViewCount(1);
            log.debug("Creating new view record");
        }

        FlightViewHistory savedView = viewHistoryDao.saveOrUpdateView(viewHistory);
        log.info("View recorded successfully. View count: {}", savedView.getViewCount());

        return convertToDto(savedView);
    }

    /**
     * Получить историю просмотров текущего пользователя
     */
    public List<FlightViewHistoryDto> getCurrentUserRecentViews(int limit) {
        Integer userId = securityUtils.getCurrentUserIdOrThrow();
        return viewHistoryDao.getRecentViewsByUserId(userId, limit).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Получить историю просмотров конкретного пользователя (для админов)
     */
    public List<FlightViewHistoryDto> getRecentViews(Integer userId, int limit) {
        return viewHistoryDao.getRecentViewsByUserId(userId, limit).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // Остальные методы аналогично обновляем...

    public List<FlightViewHistoryDto> getCurrentUserMostViewedFlights(int limit) {
        Integer userId = securityUtils.getCurrentUserIdOrThrow();
        return viewHistoryDao.getMostViewedByUserId(userId, limit).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<FlightViewHistoryDto> getCurrentUserViewHistory() {
        Integer userId = securityUtils.getCurrentUserIdOrThrow();
        return viewHistoryDao.getUserViewHistory(userId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public Integer getCurrentUserFlightViewCount(Integer flightId) {
        Integer userId = securityUtils.getCurrentUserIdOrThrow();
        return viewHistoryDao.getViewCount(userId, flightId);
    }

    @Transactional
    public void clearCurrentUserHistory() {
        Integer userId = securityUtils.getCurrentUserIdOrThrow();
        List<FlightViewHistory> userHistory = viewHistoryDao.getUserViewHistory(userId);
        userHistory.forEach(history -> viewHistoryDao.deleteViewHistory(history.getId()));
        log.info("Cleared view history for user: {}", userId);
    }

    private FlightViewHistoryDto convertToDto(FlightViewHistory viewHistory) {
        FlightViewHistoryDto dto = new FlightViewHistoryDto();
        dto.setId(viewHistory.getId());
        dto.setViewedAt(viewHistory.getViewedAt());
        dto.setViewCount(viewHistory.getViewCount());
        return dto;
    }
}