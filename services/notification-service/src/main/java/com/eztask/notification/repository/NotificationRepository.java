package com.eztask.notification.repository;

import com.eztask.notification.model.Notification;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class NotificationRepository {

    // Primary in-memory index for low-latency queries, indexed by recipientUserId
    private final Map<String, List<Notification>> userNotifications = new ConcurrentHashMap<>();

    public Notification save(Notification notification) {
        if (notification.getId() == null) {
            notification.setId(UUID.randomUUID().toString());
        }
        String userId = notification.getRecipientUserId() != null ? notification.getRecipientUserId() : "broadcast";
        userNotifications.computeIfAbsent(userId, k -> Collections.synchronizedList(new ArrayList<>()));

        List<Notification> list = userNotifications.get(userId);
        synchronized (list) {
            // Check if updating existing
            list.removeIf(n -> n.getId().equals(notification.getId()));
            list.add(0, notification); // newest first
        }
        return notification;
    }

    public List<Notification> findByRecipientUserId(String userId) {
        List<Notification> direct = userNotifications.getOrDefault(userId, Collections.emptyList());
        List<Notification> broadcast = userNotifications.getOrDefault("broadcast", Collections.emptyList());

        List<Notification> combined = new ArrayList<>(direct);
        combined.addAll(broadcast);
        combined.sort((a, b) -> {
            if (a.getCreatedAt() == null && b.getCreatedAt() == null) return 0;
            if (a.getCreatedAt() == null) return 1;
            if (b.getCreatedAt() == null) return -1;
            return b.getCreatedAt().compareTo(a.getCreatedAt());
        });
        return combined;
    }

    public Optional<Notification> findById(String id) {
        if (id == null) {
            return Optional.empty();
        }
        for (List<Notification> list : userNotifications.values()) {
            if (list != null) {
                synchronized (list) {
                    for (Notification n : list) {
                        if (id.equals(n.getId())) {
                            return Optional.of(n);
                        }
                    }
                }
            }
        }
        return Optional.empty();
    }

    public long countUnreadByRecipientUserId(String userId) {
        return findByRecipientUserId(userId).stream()
                .filter(n -> !n.isRead())
                .count();
    }

    public void markAllAsReadForUser(String userId) {
        List<Notification> list = userNotifications.get(userId);
        if (list != null) {
            synchronized (list) {
                list.forEach(n -> n.setRead(true));
            }
        }
    }
}
