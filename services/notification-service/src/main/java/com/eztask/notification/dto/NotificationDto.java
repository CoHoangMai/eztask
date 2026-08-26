package com.eztask.notification.dto;

import com.eztask.notification.model.Notification;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

public class NotificationDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private String id;
        private String recipientUserId;
        private String actorId;
        private String taskId;
        private String boardId;
        private String title;
        private String message;
        private String type;
        private boolean read;
        private Instant createdAt;

        public static Response fromEntity(Notification notification) {
            return Response.builder()
                    .id(notification.getId())
                    .recipientUserId(notification.getRecipientUserId())
                    .actorId(notification.getActorId())
                    .taskId(notification.getTaskId())
                    .boardId(notification.getBoardId())
                    .title(notification.getTitle())
                    .message(notification.getMessage())
                    .type(notification.getType())
                    .read(notification.isRead())
                    .createdAt(notification.getCreatedAt())
                    .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UnreadCountResponse {
        private long unreadCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ListResponse {
        private List<Response> notifications;
        private long unreadCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BroadcastRequest {
        private String title;
        private String message;
        private String boardId;
    }
}
