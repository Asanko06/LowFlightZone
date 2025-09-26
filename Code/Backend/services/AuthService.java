package com.example.lowflightzone.services;

import com.example.lowflightzone.dao.UserDao;
import com.example.lowflightzone.dto.AuthRequest;
import com.example.lowflightzone.dto.AuthResponse;
import com.example.lowflightzone.entity.User;
import com.example.lowflightzone.security.CustomUserDetailsService;
import com.example.lowflightzone.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserDao userDao;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;

    public AuthResponse register(AuthRequest request) {
        if (userDao.findByEmail(request.getEmail()).isPresent()) {
            return new AuthResponse(null, request.getEmail(), "User already exists");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getEmail().split("@")[0]); // временное имя

        User savedUser = userDao.save(user);

        final UserDetails userDetails = userDetailsService.loadUserByUsername(savedUser.getEmail());
        final String jwt = jwtUtil.generateToken(userDetails);

        return new AuthResponse(jwt, savedUser.getEmail(), "Registration successful");
    }

    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        final UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        final String jwt = jwtUtil.generateToken(userDetails);

        return new AuthResponse(jwt, request.getEmail(), "Login successful");
    }
}