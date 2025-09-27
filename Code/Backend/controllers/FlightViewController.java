package com.example.lowflightzone.controllers;

import com.example.lowflightzone.dto.FlightViewHistoryDto;
import com.example.lowflightzone.services.FlightViewHistoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/flight-views")
@Tag(name = "Flight View History", description = "API для управления историей просмотров рейсов")
public class FlightViewController {

    private final FlightViewHistoryService viewHistoryService;

    @Autowired
    public FlightViewController(FlightViewHistoryService viewHistoryService) {
        this.viewHistoryService = viewHistoryService;
    }

    @Operation(summary = "Записать просмотр рейса")
    @PostMapping("/record")
    public ResponseEntity<FlightViewHistoryDto> recordFlightView(
            @RequestParam Integer userId,
            @RequestParam Integer flightId) {

        FlightViewHistoryDto viewHistory = viewHistoryService.recordFlightView(userId, flightId);
        return ResponseEntity.ok(viewHistory);
    }

    @Operation(summary = "Получить последние просмотренные рейсы")
    @GetMapping("/user/{userId}/recent")
    public ResponseEntity<List<FlightViewHistoryDto>> getRecentViews(
            @PathVariable Integer userId,
            @RequestParam(defaultValue = "10") int limit) {

        List<FlightViewHistoryDto> recentViews = viewHistoryService.getRecentViews(userId, limit);
        return ResponseEntity.ok(recentViews);
    }

    @Operation(summary = "Получить самые часто просматриваемые рейсы")
    @GetMapping("/user/{userId}/most-viewed")
    public ResponseEntity<List<FlightViewHistoryDto>> getMostViewedFlights(
            @PathVariable Integer userId,
            @RequestParam(defaultValue = "10") int limit) {

        List<FlightViewHistoryDto> mostViewed = viewHistoryService.getMostViewedFlights(userId, limit);
        return ResponseEntity.ok(mostViewed);
    }

    @Operation(summary = "Получить полную историю просмотров")
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<FlightViewHistoryDto>> getUserViewHistory(@PathVariable Integer userId) {
        List<FlightViewHistoryDto> history = viewHistoryService.getUserViewHistory(userId);
        return ResponseEntity.ok(history);
    }

    @Operation(summary = "Получить количество просмотров рейса")
    @GetMapping("/user/{userId}/flight/{flightId}/count")
    public ResponseEntity<Integer> getViewCount(
            @PathVariable Integer userId,
            @PathVariable Integer flightId) {

        Integer viewCount = viewHistoryService.getFlightViewCount(userId, flightId);
        return ResponseEntity.ok(viewCount);
    }

    @Operation(summary = "Очистить историю просмотров")
    @DeleteMapping("/user/{userId}")
    public ResponseEntity<String> clearHistory(@PathVariable Integer userId) {
        viewHistoryService.clearUserHistory(userId);
        return ResponseEntity.ok("History cleared successfully");
    }

    @Operation(summary = "Удалить рейс из истории")
    @DeleteMapping("/user/{userId}/flight/{flightId}")
    public ResponseEntity<String> removeFromHistory(
            @PathVariable Integer userId,
            @PathVariable Integer flightId) {

        viewHistoryService.removeFlightFromHistory(userId, flightId);
        return ResponseEntity.ok("Flight removed from history");
    }
}