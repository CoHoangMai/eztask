package com.eztask.task.service;

import com.eztask.task.dto.TaskDto;
import com.eztask.task.model.*;
import com.eztask.task.repository.BoardRepository;
import com.eztask.task.repository.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private BoardRepository boardRepository;

    @InjectMocks
    private TaskService taskService;

    private Task sampleTask;
    private Board sampleBoard;

    @BeforeEach
    void setUp() {
        sampleTask = Task.builder()
                .id("task-101")
                .boardId("board-1")
                .columnId("col-todo")
                .title("Sample Test Task")
                .description("Testing Task Service")
                .priority(TaskPriority.HIGH)
                .checklist(new ArrayList<>())
                .comments(new ArrayList<>())
                .build();

        BoardColumn colTodo = BoardColumn.builder().id("col-todo").title("To Do").cardIds(new ArrayList<>(List.of("task-101"))).build();
        BoardColumn colDone = BoardColumn.builder().id("col-done").title("Done").cardIds(new ArrayList<>()).build();

        sampleBoard = Board.builder()
                .id("board-1")
                .title("Test Board")
                .columns(new ArrayList<>(List.of(colTodo, colDone)))
                .build();
    }

    @Test
    void testCreateTaskSuccess() {
        TaskDto.CreateTaskRequest request = TaskDto.CreateTaskRequest.builder()
                .boardId("board-1")
                .columnId("col-todo")
                .title("New Feature")
                .priority(TaskPriority.MEDIUM)
                .build();

        when(taskRepository.save(any(Task.class))).thenReturn(sampleTask);
        when(boardRepository.findById("board-1")).thenReturn(Optional.of(sampleBoard));

        Task created = taskService.createTask(request);

        assertNotNull(created);
        assertEquals("Sample Test Task", created.getTitle());
        verify(taskRepository, times(1)).save(any(Task.class));
    }

    @Test
    void testMoveTaskSuccess() {
        when(taskRepository.findById("task-101")).thenReturn(Optional.of(sampleTask));
        when(taskRepository.save(any(Task.class))).thenReturn(sampleTask);
        when(boardRepository.findById("board-1")).thenReturn(Optional.of(sampleBoard));

        TaskDto.MoveTaskRequest moveReq = TaskDto.MoveTaskRequest.builder()
                .targetColumnId("col-done")
                .targetIndex(0)
                .build();

        Task moved = taskService.moveTask("task-101", moveReq);

        assertNotNull(moved);
        assertEquals("col-done", moved.getColumnId());
        verify(taskRepository, times(1)).save(sampleTask);
        verify(boardRepository, times(1)).save(sampleBoard);
    }

    @Test
    void testAddCommentSuccess() {
        when(taskRepository.findById("task-101")).thenReturn(Optional.of(sampleTask));
        when(taskRepository.save(any(Task.class))).thenReturn(sampleTask);

        Assignee author = Assignee.builder().id("usr-1").name("Alex Morgan").build();
        TaskDto.AddCommentRequest commentReq = TaskDto.AddCommentRequest.builder()
                .text("LGTM! Moving to QA.")
                .build();

        Task result = taskService.addComment("task-101", commentReq, author);

        assertNotNull(result);
        assertEquals(1, result.getComments().size());
        assertEquals("LGTM! Moving to QA.", result.getComments().get(0).getText());
    }

    @Test
    void testAddAndToggleChecklistItem() {
        when(taskRepository.findById("task-101")).thenReturn(Optional.of(sampleTask));
        when(taskRepository.save(any(Task.class))).thenReturn(sampleTask);

        TaskDto.AddChecklistItemRequest itemReq = TaskDto.AddChecklistItemRequest.builder()
                .text("Write unit tests")
                .build();

        Task withItem = taskService.addChecklistItem("task-101", itemReq);
        assertEquals(1, withItem.getChecklist().size());
        String itemId = withItem.getChecklist().get(0).getId();

        Task toggled = taskService.toggleChecklistItem("task-101", itemId, true);
        assertTrue(toggled.getChecklist().get(0).isCompleted());
    }
}
