package com.example.lowflightzone.services;

import com.example.lowflightzone.entity.Flight;
import com.example.lowflightzone.entity.FlightSubscription;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class NotificationService {

    public void sendSubscriptionConfirmation(FlightSubscription subscription) {
        // В реальной реализации здесь будет интеграция с FCM/APNS
        log.info("Отправка подтверждения подписки для пользователя: {}, рейс: {}",
                subscription.getUser().getEmail(),   // ✅ берём email из User
                subscription.getFlight().getFlightNumber());
    }

    public void sendFlightStatusUpdate(Flight flight, String oldStatus) {
        log.info("Отправка уведомления об изменении статуса рейса {}: {} -> {}",
                flight.getFlightNumber(), oldStatus, flight.getStatus());
    }

    public void sendDelayNotification(Flight flight, Integer delayMinutes) {
        log.info("Отправка уведомления о задержке рейса {}: {} минут",
                flight.getFlightNumber(), delayMinutes);
    }

    public void sendCancellationNotification(Flight flight) {
        log.info("Отправка уведомления об отмене рейса: {}", flight.getFlightNumber());
    }
}