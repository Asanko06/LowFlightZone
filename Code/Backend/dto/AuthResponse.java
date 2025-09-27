package com.example.lowflightzone.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;    // JWT токен (null при ошибке)
    private String email;
    private String message;  // Сообщение об успешной регистрации/ошибке
}
