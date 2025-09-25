package com.example.lowflightzone.controllers;

import com.example.lowflightzone.dto.FlightDto;
import com.example.lowflightzone.services.FlightService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/flights")
public class FlightController {

    private final FlightService flightService;

    @Autowired
    public FlightController(FlightService flightService) {
        this.flightService = flightService;
    }

    @GetMapping
    public ResponseEntity<List<FlightDto>> getFlights(
            @RequestParam(name = "departure", required = false) final String departureAirport,
            @RequestParam(name = "arrival", required = false) final String arrivalAirport,
            @RequestParam(name = "status", required = false) final String status
    ) {
        List<FlightDto> flights = flightService.getFlights(departureAirport, arrivalAirport, status);
        return ResponseEntity.ok(flights);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FlightDto> getFlightById(@PathVariable final Integer id) {
        FlightDto flight = flightService.getFlightById(id);
        return ResponseEntity.ok(flight);
    }

    @GetMapping("/number/{flightNumber}")
    public ResponseEntity<FlightDto> getFlightByNumber(@PathVariable final String flightNumber) {
        FlightDto flight = flightService.getFlightByNumber(flightNumber);
        return ResponseEntity.ok(flight);
    }

    @PostMapping
    public ResponseEntity<FlightDto> addFlight(@RequestBody final FlightDto flightDto) {
        FlightDto newFlight = flightService.addFlight(flightDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(newFlight);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteFlight(@PathVariable final Integer id) {
        flightService.deleteFlightById(id);
        return ResponseEntity.ok("Рейс успешно удален");
    }

    @PutMapping("/{id}")
    public ResponseEntity<FlightDto> updateFlight(@PathVariable final Integer id,
                                                  @RequestBody final FlightDto flightDto) {
        FlightDto updatedFlight = flightService.updateFlight(id, flightDto);
        return ResponseEntity.ok(updatedFlight);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<FlightDto> patchFlight(@PathVariable final Integer id,
                                                 @RequestBody final FlightDto flightDto) {
        FlightDto updatedFlight = flightService.patchFlight(id, flightDto);
        return ResponseEntity.ok(updatedFlight);
    }
}