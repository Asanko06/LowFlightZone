package com.example.lowflightzone.security;

import com.example.lowflightzone.dao.UserDao;
import com.example.lowflightzone.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class SecurityUtils {

    private final UserDao userDao;

    /**
     * Получить текущего аутентифицированного пользователя
     */
    public Optional<User> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() ||
                authentication.getPrincipal().equals("anonymousUser")) {
            return Optional.empty();
        }

        if (authentication.getPrincipal() instanceof UserDetails) {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            return userDao.findByEmail(userDetails.getUsername());
        }

        if (authentication.getPrincipal() instanceof String) {
            String username = (String) authentication.getPrincipal();
            return userDao.findByEmail(username);
        }

        return Optional.empty();
    }

    /**
     * Получить ID текущего пользователя
     */
    public Optional<Integer> getCurrentUserId() {
        return getCurrentUser().map(User::getId);
    }

    /**
     * Получить текущего пользователя или выбросить исключение
     */
    public User getCurrentUserOrThrow() {
        return getCurrentUser()
                .orElseThrow(() -> new RuntimeException("User not authenticated"));
    }

    /**
     * Получить ID текущего пользователя или выбросить исключение
     */
    public Integer getCurrentUserIdOrThrow() {
        return getCurrentUserId()
                .orElseThrow(() -> new RuntimeException("User not authenticated"));
    }
}