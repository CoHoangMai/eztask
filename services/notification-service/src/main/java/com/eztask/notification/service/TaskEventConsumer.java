package com.eztask.notification.service;

import com.eztask.notification.dto.event.TaskEventPayload;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class TaskEventConsumer {

    private final NotificationService notificationService;

    @KafkaListener(topics = "task-events", groupId = "notification-group")
    public void consumeTaskEvent(TaskEventPayload payload) {
        log.info("Received Kafka event from topic 'task-events': TaskId=[{}], EventType=[{}]",
                payload.getTaskId(), payload.getEventType());
        try {
            notificationService.processTaskEvent(payload);
        } catch (Exception e) {
            log.error("Error processing task event from Kafka: {}", e.getMessage(), e);
        }
    }
}
