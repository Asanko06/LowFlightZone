package com.example.lowflightzone.services;

import com.example.lowflightzone.dao.FlightDao;
import com.example.lowflightzone.dao.FlightSubscriptionDao;
import com.example.lowflightzone.dao.UserDao;
import com.example.lowflightzone.dto.FlightDto;
import com.example.lowflightzone.dto.FlightSubscriptionDto;
import com.example.lowflightzone.dto.UserDto;
import com.example.lowflightzone.entity.Flight;
import com.example.lowflightzone.entity.FlightSubscription;
import com.example.lowflightzone.entity.User;
import com.example.lowflightzone.exceptions.FlightException;
import com.example.lowflightzone.exceptions.SubscriptionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FlightSubscriptionService {

    private final FlightSubscriptionDao subscriptionDao;
    private final FlightDao flightDao;
    private final NotificationService notificationService;
    private final UserDao userDao;

    @Autowired
    public FlightSubscriptionService(FlightSubscriptionDao subscriptionDao,
                                     FlightDao flightDao,
                                     NotificationService notificationService, UserDao userDao) {
        this.subscriptionDao = subscriptionDao;
        this.flightDao = flightDao;
        this.notificationService = notificationService;
        this.userDao = userDao;
    }

    public FlightSubscriptionDto subscribeToFlight(String flightNumber, String userEmail, String deviceToken) {
        Flight flight = flightDao.findByFlightNumber(flightNumber)
                .orElseThrow(() -> new FlightException("Рейс не найден: " + flightNumber));

        if (subscriptionDao.existsByFlightAndUser(flightNumber, userEmail)) {
            throw new SubscriptionException("Подписка уже существует для пользователя: " + userEmail);
        }

        // ищем пользователя по email
        User user = userDao.findByEmail(userEmail)
                .orElseThrow(() -> new SubscriptionException("Пользователь не найден: " + userEmail));

        FlightSubscription subscription = new FlightSubscription();
        subscription.setFlight(flight);
        subscription.setUser(user);
        subscription.setNotificationTypes("DELAY,CANCELLATION,STATUS_CHANGE");

        FlightSubscription savedSubscription = subscriptionDao.save(subscription);

        notificationService.sendSubscriptionConfirmation(savedSubscription);

        return convertToDto(savedSubscription);
    }


    public void unsubscribeFromFlight(Integer subscriptionId) {
        FlightSubscription subscription = subscriptionDao.findAll().stream()
                .filter(s -> s.getId().equals(subscriptionId))
                .findFirst()
                .orElseThrow(() -> new SubscriptionException("Подписка не найдена: " + subscriptionId));

        subscription.setStatus(FlightSubscription.SubscriptionStatus.CANCELLED);
        subscriptionDao.save(subscription);
    }

    public List<FlightSubscriptionDto> getUserSubscriptions(String userEmail) {
        return subscriptionDao.findByUserEmail(userEmail).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<FlightSubscriptionDto> getSubscriptionsForFlight(String flightNumber) {
        return subscriptionDao.findByFlightNumberAndStatus(flightNumber,
                        FlightSubscription.SubscriptionStatus.ACTIVE).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<FlightSubscriptionDto> getSubscriptionsByUserId(Integer userId) {
        return subscriptionDao.findActiveByUserId(userId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private FlightSubscriptionDto convertToDto(FlightSubscription subscription) {
        FlightSubscriptionDto dto = new FlightSubscriptionDto();
        dto.setId(subscription.getId());

        // Flight -> FlightDto (упрощённая конвертация)
        Flight flight = subscription.getFlight();
        FlightDto flightDto = new FlightDto();
        flightDto.setId(flight.getId());
        flightDto.setFlightNumber(flight.getFlightNumber());
        flightDto.setAirline(flight.getAirline());
        flightDto.setStatus(flight.getStatus().toString());
        flightDto.setScheduledDeparture(flight.getScheduledDeparture());
        flightDto.setScheduledArrival(flight.getScheduledArrival());
        flightDto.setEstimatedDeparture(flight.getEstimatedDeparture());
        flightDto.setEstimatedArrival(flight.getEstimatedArrival());
        dto.setFlight(flightDto);

        // User -> UserDto (упрощённая конвертация)
        User user = subscription.getUser();
        UserDto userDto = new UserDto();
        userDto.setId(user.getId());
        userDto.setEmail(user.getEmail());
        userDto.setFirstName(user.getFirstName());
        userDto.setLastName(user.getLastName());
        dto.setUser(userDto);

        dto.setStatus(subscription.getStatus().toString());
        dto.setNotificationTypes(subscription.getNotificationTypes());
        dto.setCreatedAt(subscription.getCreatedAt());
        dto.setLastNotifiedAt(subscription.getLastNotifiedAt());
        dto.setNotifyBeforeHours(subscription.getNotifyBeforeHours());
        dto.setMinDelayMinutes(subscription.getMinDelayMinutes());

        return dto;
    }



}