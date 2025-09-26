package com.example.lowflightzone.controllers;

import com.example.lowflightzone.dto.FlightSubscriptionDto;
import com.example.lowflightzone.services.FlightSubscriptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/subscriptions")
@Tag(name = "Subscription Controller", description = "API для управления подписками на рейсы")
public class FlightSubscriptionController {

    private final FlightSubscriptionService subscriptionService;

    @Autowired
    public FlightSubscriptionController(FlightSubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @Operation(summary = "Подписаться на рейс")
    @PostMapping("/subscribe")
    public ResponseEntity<FlightSubscriptionDto> subscribeToFlight(
            @RequestParam String flightNumber,
            @RequestParam String userEmail,
            @RequestParam(required = false) String deviceToken) {

        FlightSubscriptionDto subscription = subscriptionService.subscribeToFlight(
                flightNumber, userEmail, deviceToken);
        return ResponseEntity.ok(subscription);
    }

    @Operation(summary = "Отписаться от рейса")
    @PostMapping("/unsubscribe/{subscriptionId}")
    public ResponseEntity<String> unsubscribeFromFlight(@PathVariable Integer subscriptionId) {
        subscriptionService.unsubscribeFromFlight(subscriptionId);
        return ResponseEntity.ok("Подписка успешно отменена");
    }

    @Operation(summary = "Получить подписки пользователя")
    @GetMapping("/user/{userEmail}")
    public ResponseEntity<List<FlightSubscriptionDto>> getUserSubscriptions(
            @PathVariable String userEmail) {

        List<FlightSubscriptionDto> subscriptions = subscriptionService.getUserSubscriptions(userEmail);
        return ResponseEntity.ok(subscriptions);
    }

    @Operation(summary = "Получить подписки на рейс")
    @GetMapping("/flight/{flightNumber}")
    public ResponseEntity<List<FlightSubscriptionDto>> getSubscriptionsForFlight(
            @PathVariable String flightNumber) {

        List<FlightSubscriptionDto> subscriptions = subscriptionService.getSubscriptionsForFlight(flightNumber);
        return ResponseEntity.ok(subscriptions);
    }
}