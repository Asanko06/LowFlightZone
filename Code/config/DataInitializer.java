package com.example.lowflightzone.config;

import com.example.lowflightzone.dao.FlightDao;
import com.example.lowflightzone.entity.Flight;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final FlightDao flightDao;

    @Override
    public void run(String... args) throws Exception {
        log.info("✅ DataInitializer started");
        long count = flightDao.findAll().size();

        if (count == 0) {
            // Добавляем тестовые рейсы
            Flight flight1 = new Flight();
            flight1.setFlightNumber("SU100");
            flight1.setAirline("Аэрофлот");
            flight1.setDepartureAirport("SVO");
            flight1.setArrivalAirport("LED");
            flight1.setScheduledDeparture(LocalDateTime.now().plusHours(3));
            flight1.setStatus("SCHEDULED");
            flight1.setDelayMinutes(0);

            Flight flight2 = new Flight();
            flight2.setFlightNumber("SU200");
            flight2.setAirline("Аэрофлот");
            flight2.setDepartureAirport("DME");
            flight2.setArrivalAirport("SVO");
            flight2.setScheduledDeparture(LocalDateTime.now().plusHours(5));
            flight2.setStatus("DELAYED");
            flight2.setDelayMinutes(30);

            flightDao.save(flight1);
            flightDao.save(flight2);

            log.info("✅ Added 2 test flights to database");
        } else {
            log.info("✅ Current flights in database: {}", count);
        }
    }
}