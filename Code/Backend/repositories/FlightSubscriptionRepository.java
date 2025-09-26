package com.example.lowflightzone.repositories;

import com.example.lowflightzone.entity.FlightSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FlightSubscriptionRepository extends JpaRepository<FlightSubscription, Integer> {

    List<FlightSubscription> findByUserEmailAndStatus(String userEmail,
                                                      FlightSubscription.SubscriptionStatus status);

    List<FlightSubscription> findByStatus(FlightSubscription.SubscriptionStatus status);

    // метод поиска по flightNumber и статусу рейса
    List<FlightSubscription> findByFlight_FlightNumberAndFlight_Status(String flightNumber,
                                                                       FlightSubscription.SubscriptionStatus status);

    // проверка, есть ли подписка на рейс у пользователя
    boolean existsByFlightFlightNumberAndUserEmail(String flightNumber, String userEmail);

    @Query("SELECT fs FROM FlightSubscription fs WHERE fs.user.id = :userId AND fs.status = 'ACTIVE'")
    List<FlightSubscription> findActiveSubscriptionsByUserId(@Param("userId") Integer userId);

    @Query("SELECT fs FROM FlightSubscription fs WHERE fs.flight.status IN :statuses AND fs.status = 'ACTIVE'")
    List<FlightSubscription> findActiveSubscriptionsForFlightStatus(@Param("statuses") List<String> statuses);
}
