package com.eztask.task.service;

import com.eztask.task.config.KafkaConfig;
import com.eztask.task.dto.event.TaskEventPayload;
import com.eztask.task.dto.event.TaskEventType;
import com.eztask.task.model.Assignee;
import com.eztask.task.model.Task;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class TaskEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void sendTaskEvent(Task task, TaskEventType eventType, String actorId, String customMessage) {
        try {
            List<String> assigneeIds = task.getAssignees() != null
                    ? task.getAssignees().stream().map(Assignee::getId).toList()
                    : Collections.emptyList();

            String message = customMessage != null ? customMessage : buildDefaultMessage(task, eventType);

            TaskEventPayload payload = TaskEventPayload.builder()
                    .eventId(UUID.randomUUID().toString())
                    .eventType(eventType)
                    .taskId(task.getId())
                    .boardId(task.getBoardId())
                    .columnId(task.getColumnId())
                    .title(task.getTitle())
                    .priority(task.getPriority() != null ? task.getPriority().name() : null)
                    .assigneeIds(assigneeIds)
                    .actorId(actorId != null ? actorId : "system")
                    .message(message)
                    .timestamp(Instant.now())
                    .build();

            log.info("Publishing event [{}] for task [{}] to Kafka topic [{}]", eventType, task.getId(), KafkaConfig.TASK_EVENTS_TOPIC);
            kafkaTemplate.send(KafkaConfig.TASK_EVENTS_TOPIC, task.getId(), payload);
        } catch (Exception e) {
            log.error("Failed to publish task event to Kafka for task [{}]: {}", task.getId(), e.getMessage());
        }
    }

    private String buildDefaultMessage(Task task, TaskEventType eventType) {
        return switch (eventType) {
            case TASK_CREATED -> "Task created: " + task.getTitle();
            case TASK_UPDATED -> "Task updated: " + task.getTitle();
            case TASK_MOVED -> "Task moved to column: " + task.getColumnId();
            case TASK_ASSIGNED -> "Task assignees updated: " + task.getTitle();
            case TASK_COMPLETED -> "Task marked as completed: " + task.getTitle();
            case TASK_DELETED -> "Task deleted: " + task.getTitle();
        };
    }
}
