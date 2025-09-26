package com.example.lowflightzone.dao;

import com.example.lowflightzone.entity.FlightSubscription;
import com.example.lowflightzone.repositories.FlightSubscriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public class FlightSubscriptionDao {

    private final FlightSubscriptionRepository subscriptionRepository;

    @Autowired
    public FlightSubscriptionDao(FlightSubscriptionRepository subscriptionRepository) {
        this.subscriptionRepository = subscriptionRepository;
    }

    public List<FlightSubscription> findActiveByUserId(Integer userId) {
        return subscriptionRepository.findActiveSubscriptionsByUserId(userId);
    }

    public List<FlightSubscription> findAll() {
        return subscriptionRepository.findAll();
    }

    public FlightSubscription save(FlightSubscription subscription) {
        return subscriptionRepository.save(subscription);
    }

    public List<FlightSubscription> findByFlightNumberAndStatus(String flightNumber,
                                                                FlightSubscription.SubscriptionStatus status) {
        // исправлено имя метода
        return subscriptionRepository.findByFlight_FlightNumberAndFlight_Status(flightNumber, status);
    }

    public List<FlightSubscription> findByUserEmail(String userEmail) {
        return subscriptionRepository.findByUserEmailAndStatus(userEmail,
                FlightSubscription.SubscriptionStatus.ACTIVE);
    }

    public boolean existsByFlightAndUser(String flightNumber, String userEmail) {
        // исправлено имя метода
        return subscriptionRepository.existsByFlightFlightNumberAndUserEmail(flightNumber, userEmail);
    }

    public void deleteById(Integer id) {
        subscriptionRepository.deleteById(id);
    }
}
