package com.example.lowflightzone.services;

import com.example.lowflightzone.dao.UserDao;
import com.example.lowflightzone.dto.UserDto;
import com.example.lowflightzone.entity.FlightSubscription;
import com.example.lowflightzone.entity.User;
import com.example.lowflightzone.exceptions.SubscriptionException;
import com.example.lowflightzone.exceptions.UserException;
import com.example.lowflightzone.repositories.FlightSubscriptionRepository;
import com.example.lowflightzone.repositories.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserDao userDao;
    private final PasswordEncoder passwordEncoder;
    private final FlightSubscriptionRepository subscriptionRepository;
    private final FlightSubscriptionService subscriptionService;

    @Autowired
    public UserService(UserDao userDao, UserRepository userRepository, FlightSubscriptionRepository subscriptionRepository, FlightSubscriptionService subscriptionService, PasswordEncoder passwordEncoder) {
        this.userDao = userDao;
        this.subscriptionRepository = subscriptionRepository;
        this.userRepository = userRepository;
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

    // 🔥 Новый метод для сохранения deviceToken
    public void updateDeviceToken(Integer userId, String token) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserException("Пользователь не найден с id=" + userId));
        user.setDeviceToken(token);
        userRepository.save(user);
    }

    @Transactional
    public void updateWebPushSubscription(Integer userId, String endpoint, String p256dh, String auth) {
        // 1️⃣ Проверяем, существует ли пользователь
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserException("Пользователь не найден: " + userId));

        // 2️⃣ Ищем его активную подписку
        FlightSubscription subscription = subscriptionRepository
                .findFirstByUserIdAndStatus(userId, FlightSubscription.SubscriptionStatus.ACTIVE)
                .orElseThrow(() -> new SubscriptionException("Активная подписка не найдена для пользователя id=" + userId));

        // 3️⃣ Обновляем параметры Web Push (если они переданы)
        if (endpoint != null && !endpoint.isBlank()) {
            subscription.setEndpoint(endpoint);
        }
        if (p256dh != null && !p256dh.isBlank()) {
            subscription.setP256dh(p256dh);
        }
        if (auth != null && !auth.isBlank()) {
            subscription.setAuth(auth);
        }

        // 4️⃣ Сохраняем изменения
        subscriptionRepository.save(subscription);
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

        User user = new User();
        user.setEmail(userDto.getEmail());
        user.setFirstName(userDto.getFirstName());       // имя
        user.setLastName(userDto.getLastName());         // фамилия
        user.setPhoneNumber(userDto.getPhoneNumber());   // телефон
        user.setDeviceToken(userDto.getDeviceToken());
        user.setPassword(passwordEncoder.encode(userDto.getPassword())); // хешируем пароль

        User savedUser = userDao.save(user);
        return convertToDto(savedUser);
    }

    public void deleteUser(Integer id) {
        userDao.findById(id)
                .orElseThrow(() -> new UserException("Пользователь не найден: " + id));
        userDao.deleteById(id);
    }

    @Transactional
    public UserDto updateUser(Integer id, UserDto dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserException("Пользователь не найден с id = " + id));

        // ✅ Обновляем только те поля, которые пришли
        if (dto.getFirstName() != null) user.setFirstName(dto.getFirstName());
        if (dto.getLastName() != null) user.setLastName(dto.getLastName());
        if (dto.getPhoneNumber() != null) user.setPhoneNumber(dto.getPhoneNumber());

        // ❗ Email менять по желанию — обычно его не дают редактировать
        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            user.setPassword(dto.getPassword()); // тут лучше добавить шифрование пароля!
        }

        userRepository.save(user);
        return convertToDto(user);
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

        // ✅ Считаем только активные подписки пользователя
        if (user.getSubscriptions() != null) {
            long activeCount = user.getSubscriptions().stream()
                    .filter(s -> s.getStatus() == FlightSubscription.SubscriptionStatus.ACTIVE)
                    .count();
            dto.setSubscriptionCount((int) activeCount);
        } else {
            dto.setSubscriptionCount(0);
        }

        return dto;
    }
}
