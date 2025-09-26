package com.example.lowflightzone.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AuthResponse {
    private String token;
    private String email;
    private String message;

    public AuthResponse(String token, String email, String message) {
        this.token = token;
        this.email = email;
        this.message = message;
    }
}