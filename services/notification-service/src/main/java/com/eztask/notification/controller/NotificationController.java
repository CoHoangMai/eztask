package com.eztask.notification.controller;

import com.eztask.notification.dto.NotificationDto;
import com.eztask.notification.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notification Management", description = "Endpoints for retrieving, managing and broadcasting real-time notifications")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @Operation(summary = "Get current user notifications", description = "Retrieves all personal and board notifications for the authenticated user")
    public ResponseEntity<NotificationDto.ListResponse> getNotifications(Authentication authentication) {
        String userId = authentication != null ? authentication.getName() : "anonymous";
        return ResponseEntity.ok(notificationService.getUserNotifications(userId));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get unread notifications count", description = "Returns the count of unread notifications for badge display")
    public ResponseEntity<NotificationDto.UnreadCountResponse> getUnreadCount(Authentication authentication) {
        String userId = authentication != null ? authentication.getName() : "anonymous";
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(new NotificationDto.UnreadCountResponse(count));
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "Mark a notification as read", description = "Updates a specific notification status to read")
    public ResponseEntity<NotificationDto.Response> markAsRead(@PathVariable String id, Authentication authentication) {
        String userId = authentication != null ? authentication.getName() : "anonymous";
        return ResponseEntity.ok(notificationService.markAsRead(id, userId));
    }

    @PutMapping("/mark-all-read")
    @Operation(summary = "Mark all notifications as read", description = "Clears unread flag on all notifications for current user")
    public ResponseEntity<Void> markAllRead(Authentication authentication) {
        String userId = authentication != null ? authentication.getName() : "anonymous";
        notificationService.markAllAsRead(userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/broadcast")
    @Operation(summary = "Broadcast a custom notification", description = "Sends a real-time notification to all connected clients on a board via STOMP WebSocket")
    public ResponseEntity<NotificationDto.Response> broadcastNotification(@RequestBody NotificationDto.BroadcastRequest request,
                                                                         Authentication authentication) {
        String actorId = authentication != null ? authentication.getName() : "system";
        return ResponseEntity.ok(notificationService.broadcastCustomNotification(request, actorId));
    }
}
