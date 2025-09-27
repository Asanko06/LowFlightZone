package com.example.lowflightzone.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Getter
@Setter
public class FlightViewHistoryDto {
    private Integer id;
    private UserDto user;
    private FlightDto flight;
    private LocalDateTime viewedAt;
    private Integer viewCount;

    // Упрощенный DTO для списка
    @Getter
    @Setter
    public static class SimpleViewHistoryDto {
        private Integer flightId;
        private String flightNumber;
        private LocalDateTime lastViewedAt;
        private Integer viewCount;

        public SimpleViewHistoryDto(Integer flightId, String flightNumber, LocalDateTime lastViewedAt, Integer viewCount) {
            this.flightId = flightId;
            this.flightNumber = flightNumber;
            this.lastViewedAt = lastViewedAt;
            this.viewCount = viewCount;
        }
    }
}