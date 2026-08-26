package com.eztask.notification.service;

import com.eztask.notification.dto.NotificationDto;
import com.eztask.notification.dto.event.TaskEventPayload;
import com.eztask.notification.dto.event.TaskEventType;
import com.eztask.notification.model.Notification;
import com.eztask.notification.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private NotificationService notificationService;

    private TaskEventPayload samplePayload;

    @BeforeEach
    void setUp() {
        samplePayload = TaskEventPayload.builder()
                .eventId("evt-1")
                .eventType(TaskEventType.TASK_ASSIGNED)
                .taskId("task-123")
                .boardId("board-456")
                .title("Implement Kafka Consumer")
                .assigneeIds(List.of("user-john"))
                .actorId("user-admin")
                .message("You have been assigned to task")
                .timestamp(Instant.now())
                .build();
    }

    @Test
    void processTaskEvent_ShouldSaveNotificationAndSendStompMessage() {
        notificationService.processTaskEvent(samplePayload);

        verify(notificationRepository, atLeastOnce()).save(any(Notification.class));
        verify(messagingTemplate).convertAndSendToUser(eq("user-john"), eq("/queue/notifications"), any(NotificationDto.Response.class));
        verify(messagingTemplate).convertAndSend(eq("/topic/board-board-456"), any(NotificationDto.Response.class));
    }

    @Test
    void markAsRead_ShouldUpdateNotificationStatus() {
        Notification notification = Notification.builder()
                .id("notif-1")
                .recipientUserId("user-john")
                .read(false)
                .build();

        when(notificationRepository.findById("notif-1")).thenReturn(Optional.of(notification));
        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);

        NotificationDto.Response response = notificationService.markAsRead("notif-1", "user-john");

        assertTrue(response.isRead());
        verify(notificationRepository).save(notification);
    }
}
