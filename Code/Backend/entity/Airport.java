package com.example.lowflightzone.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "airports")
@Getter
@Setter
public class Airport {
    @Id
    @Column(name = "iata_code", length = 3)
    private String iataCode;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "city")
    private String city;

    @Column(name = "country")
    private String country;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "timezone")
    private String timezone;

    // Связь с терминалами (One-to-Many)
    @OneToMany(mappedBy = "airport", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<AirportTerminalInfo> terminals = new ArrayList<>();

    // Связь с рейсами вылета (One-to-Many)
    @OneToMany(mappedBy = "departureAirport", fetch = FetchType.LAZY)
    private List<Flight> departingFlights = new ArrayList<>();

    // Связь с рейсами прилета (One-to-Many)
    @OneToMany(mappedBy = "arrivalAirport", fetch = FetchType.LAZY)
    private List<Flight> arrivingFlights = new ArrayList<>();
}