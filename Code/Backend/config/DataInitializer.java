package com.example.lowflightzone.config;

import com.example.lowflightzone.dao.AirportDao;
import com.example.lowflightzone.dao.FlightDao;
import com.example.lowflightzone.entity.Airport;
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

    private final AirportDao airportDao;
    private final FlightDao flightDao;

    @Override
    public void run(String... args) throws Exception {
        initializeAirports();
        initializeFlights();
    }

    private void initializeAirports() {
        if (airportDao.findAll().isEmpty()) {
            // Российские аэропорты
            Airport svo = createAirport("SVO", "Шереметьево", "Москва", "Россия", 55.972642, 37.414589, "Europe/Moscow");
            Airport dme = createAirport("DME", "Домодедово", "Москва", "Россия", 55.408611, 37.906111, "Europe/Moscow");
            Airport vko = createAirport("VKO", "Внуково", "Москва", "Россия", 55.591531, 37.261486, "Europe/Moscow");
            Airport led = createAirport("LED", "Пулково", "Санкт-Петербург", "Россия", 59.800292, 30.262503, "Europe/Moscow");
            Airport aer = createAirport("AER", "Сочи", "Сочи", "Россия", 43.449928, 39.956589, "Europe/Moscow");

            airportDao.save(svo);
            airportDao.save(dme);
            airportDao.save(vko);
            airportDao.save(led);
            airportDao.save(aer);

            log.info("✅ Added {} airports to database", airportDao.findAll().size());
        }
    }

    private void initializeFlights() {
        if (flightDao.findAll().isEmpty()) {
            // Тестовые рейсы между российскими аэропортами
            Airport svo = airportDao.findByIataCode("SVO").get();
            Airport led = airportDao.findByIataCode("LED").get();
            Airport dme = airportDao.findByIataCode("DME").get();
            Airport aer = airportDao.findByIataCode("AER").get();

            Flight flight1 = createFlight("SU100", "Аэрофлот", svo, led, LocalDateTime.now().plusHours(2));
            Flight flight2 = createFlight("SU200", "Аэрофлот", dme, svo, LocalDateTime.now().plusHours(3));
            Flight flight3 = createFlight("U6101", "Уральские авиалинии", svo, aer, LocalDateTime.now().plusHours(4));
            Flight flight4 = createFlight("S7101", "S7 Airlines", led, dme, LocalDateTime.now().plusHours(5));

            flightDao.save(flight1);
            flightDao.save(flight2);
            flightDao.save(flight3);
            flightDao.save(flight4);

            log.info("✅ Added {} flights to database", flightDao.findAll().size());
        }
    }

    private Airport createAirport(String code, String name, String city, String country,
                                  double lat, double lon, String timezone) {
        Airport airport = new Airport();
        airport.setIataCode(code);
        airport.setName(name);
        airport.setCity(city);
        airport.setCountry(country);
        airport.setLatitude(lat);
        airport.setLongitude(lon);
        airport.setTimezone(timezone);
        return airport;
    }

    private Flight createFlight(String number, String airline, Airport departure,
                                Airport arrival, LocalDateTime departureTime) {
        Flight flight = new Flight();
        flight.setFlightNumber(number);
        flight.setAirline(airline);
        flight.setDepartureAirport(departure);
        flight.setArrivalAirport(arrival);
        flight.setScheduledDeparture(departureTime);
        flight.setScheduledArrival(departureTime.plusHours(2));
        flight.setStatus(Flight.FlightStatus.SCHEDULED);
        flight.setDelayMinutes(0);
        return flight;
    }
}