package com.eztask.notification.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification implements Serializable {

    private static final long serialVersionUID = 1L;

    private String id;
    private String recipientUserId;
    private String actorId;
    private String taskId;
    private String boardId;
    private String title;
    private String message;
    private String type; // e.g. "TASK_ASSIGNED", "TASK_MOVED", "SYSTEM"
    private boolean read;
    private Instant createdAt;
}
