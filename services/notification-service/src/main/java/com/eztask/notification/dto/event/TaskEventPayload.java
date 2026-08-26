package com.eztask.notification.dto.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskEventPayload {

    private String eventId;
    private TaskEventType eventType;
    private String taskId;
    private String boardId;
    private String columnId;
    private String title;
    private String priority;
    private List<String> assigneeIds;
    private String actorId;
    private String message;
    private Instant timestamp;
}
