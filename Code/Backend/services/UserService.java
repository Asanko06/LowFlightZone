package com.example.lowflightzone.services;

import com.example.lowflightzone.dao.UserDao;
import com.example.lowflightzone.dto.UserDto;
import com.example.lowflightzone.entity.User;
import com.example.lowflightzone.exceptions.UserException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserDao userDao;
    private final PasswordEncoder passwordEncoder;
    private final FlightSubscriptionService subscriptionService;

    @Autowired
    public UserService(UserDao userDao, FlightSubscriptionService subscriptionService, PasswordEncoder passwordEncoder) {
        this.userDao = userDao;
        this.passwordEncoder = passwordEncoder;
        this.subscriptionService = subscriptionService;
    }

    public List<UserDto> getAllUsers() {
        return userDao.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public UserDto getUserById(Integer id) {
        User user = userDao.findById(id)
                .orElseThrow(() -> new UserException("Пользователь не найден: " + id));
        return convertToDto(user);
    }

    public UserDto getUserByEmail(String email) {
        User user = userDao.findByEmail(email)
                .orElseThrow(() -> new UserException("Пользователь не найден: " + email));
        return convertToDto(user);
    }

    public UserDto createUser(UserDto userDto) {
        if (userDao.existsByEmail(userDto.getEmail())) {
            throw new UserException("Пользователь с email " + userDto.getEmail() + " уже существует");
        }

        User user = convertToEntity(userDto);
        user.setPassword(passwordEncoder.encode(userDto.getPassword())); // добавляем эту строку

        User savedUser = userDao.save(user);
        return convertToDto(savedUser);
    }

    public void deleteUser(Integer id) {
        userDao.findById(id)
                .orElseThrow(() -> new UserException("Пользователь не найден: " + id));
        userDao.deleteById(id);
    }

    private UserDto convertToDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setDeviceToken(user.getDeviceToken());
        dto.setCreatedAt(user.getCreatedAt());

        // Загружаем подписки пользователя
        dto.setSubscriptions(subscriptionService.getSubscriptionsByUserId(user.getId()));
        dto.setSubscriptionCount(user.getSubscriptions().size());

        return dto;
    }

    private User convertToEntity(UserDto dto) {
        User user = new User();
        user.setEmail(dto.getEmail());
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setPhoneNumber(dto.getPhoneNumber());
        user.setDeviceToken(dto.getDeviceToken());

        return user;
    }
}