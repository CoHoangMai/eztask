package com.eztask.notification.service;

import com.eztask.notification.dto.NotificationDto;
import com.eztask.notification.dto.event.TaskEventPayload;
import com.eztask.notification.model.Notification;
import com.eztask.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public void processTaskEvent(TaskEventPayload payload) {
        log.info("Processing Kafka Task Event: [{}] for Task [{}] by Actor [{}]",
                payload.getEventType(), payload.getTaskId(), payload.getActorId());

        String eventType = payload.getEventType() != null ? payload.getEventType().name() : "TASK_EVENT";
        String title = buildEventTitle(payload);
        String message = payload.getMessage() != null ? payload.getMessage() : ("Task: " + payload.getTitle());

        // 1. If specific assignees exist and are not the actor, notify them directly
        if (payload.getAssigneeIds() != null && !payload.getAssigneeIds().isEmpty()) {
            for (String assigneeId : payload.getAssigneeIds()) {
                if (!assigneeId.equals(payload.getActorId())) {
                    Notification notification = Notification.builder()
                            .id(UUID.randomUUID().toString())
                            .recipientUserId(assigneeId)
                            .actorId(payload.getActorId())
                            .taskId(payload.getTaskId())
                            .boardId(payload.getBoardId())
                            .title(title)
                            .message(message)
                            .type(eventType)
                            .read(false)
                            .createdAt(payload.getTimestamp() != null ? payload.getTimestamp() : Instant.now())
                            .build();

                    notificationRepository.save(notification);
                    NotificationDto.Response response = NotificationDto.Response.fromEntity(notification);

                    // Push STOMP notification directly to user queue: /user/{assigneeId}/queue/notifications
                    log.info("Dispatching private STOMP notification to user: {}", assigneeId);
                    if (assigneeId != null) {
                        messagingTemplate.convertAndSendToUser(assigneeId, "/queue/notifications", (Object) response);
                    }
                }
            }
        }

        // 2. Broadcast to the Board channel: /topic/board-{boardId} for real-time Kanban updates
        if (payload.getBoardId() != null) {
            Notification broadcastNotif = Notification.builder()
                    .id(UUID.randomUUID().toString())
                    .recipientUserId("broadcast")
                    .actorId(payload.getActorId())
                    .taskId(payload.getTaskId())
                    .boardId(payload.getBoardId())
                    .title(title)
                    .message(message)
                    .type(eventType)
                    .read(false)
                    .createdAt(payload.getTimestamp() != null ? payload.getTimestamp() : Instant.now())
                    .build();

            notificationRepository.save(broadcastNotif);
            NotificationDto.Response broadcastResponse = NotificationDto.Response.fromEntity(broadcastNotif);

            String boardTopic = "/topic/board-" + payload.getBoardId();
            log.info("Broadcasting STOMP notification to topic [{}]", boardTopic);
            messagingTemplate.convertAndSend(boardTopic, (Object) broadcastResponse);
            messagingTemplate.convertAndSend("/topic/notifications", (Object) broadcastResponse);
        }
    }

    public NotificationDto.ListResponse getUserNotifications(String userId) {
        List<Notification> notifications = notificationRepository.findByRecipientUserId(userId);
        long unreadCount = notificationRepository.countUnreadByRecipientUserId(userId);

        List<NotificationDto.Response> dtos = notifications.stream()
                .map(NotificationDto.Response::fromEntity)
                .collect(Collectors.toList());

        return NotificationDto.ListResponse.builder()
                .notifications(dtos)
                .unreadCount(unreadCount)
                .build();
    }

    public long getUnreadCount(String userId) {
        return notificationRepository.countUnreadByRecipientUserId(userId);
    }

    public NotificationDto.Response markAsRead(String id, String userId) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found with id: " + id));

        notification.setRead(true);
        notificationRepository.save(notification);
        return NotificationDto.Response.fromEntity(notification);
    }

    public void markAllAsRead(String userId) {
        notificationRepository.markAllAsReadForUser(userId);
    }

    public NotificationDto.Response broadcastCustomNotification(NotificationDto.BroadcastRequest request, String actorId) {
        Notification notification = Notification.builder()
                .id(UUID.randomUUID().toString())
                .recipientUserId("broadcast")
                .actorId(actorId != null ? actorId : "system")
                .boardId(request.getBoardId())
                .title(request.getTitle())
                .message(request.getMessage())
                .type("BROADCAST")
                .read(false)
                .createdAt(Instant.now())
                .build();

        notificationRepository.save(notification);
        NotificationDto.Response response = NotificationDto.Response.fromEntity(notification);

        if (request.getBoardId() != null) {
            messagingTemplate.convertAndSend("/topic/board-" + request.getBoardId(), (Object) response);
        }
        messagingTemplate.convertAndSend("/topic/notifications", (Object) response);

        return response;
    }

    private String buildEventTitle(TaskEventPayload payload) {
        if (payload.getEventType() == null) return "Task Notification";
        return switch (payload.getEventType()) {
            case TASK_CREATED -> "New Task Created";
            case TASK_UPDATED -> "Task Updated";
            case TASK_MOVED -> "Task Moved";
            case TASK_ASSIGNED -> "Task Assigned To You";
            case TASK_COMPLETED -> "Task Completed";
            case TASK_DELETED -> "Task Removed";
        };
    }
}
