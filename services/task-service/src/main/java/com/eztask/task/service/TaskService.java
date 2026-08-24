package com.eztask.task.service;

import com.eztask.task.dto.TaskDto;
import com.eztask.task.dto.event.TaskEventType;
import com.eztask.task.model.*;
import com.eztask.task.repository.BoardRepository;
import com.eztask.task.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class TaskService {

    private final TaskRepository taskRepository;
    private final BoardRepository boardRepository;
    private final TaskEventProducer taskEventProducer;

    public List<Task> getTasksByBoard(String boardId) {
        return taskRepository.findByBoardId(boardId);
    }

    public Task getTaskById(String id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));
    }

    public Task createTask(TaskDto.CreateTaskRequest request) {
        Task task = Task.builder()
                .boardId(request.getBoardId())
                .columnId(request.getColumnId())
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority() != null ? request.getPriority() : TaskPriority.MEDIUM)
                .labels(request.getLabels() != null ? request.getLabels() : new ArrayList<>())
                .assignees(request.getAssignees() != null ? request.getAssignees() : new ArrayList<>())
                .dueDate(request.getDueDate())
                .estimatedHours(request.getEstimatedHours())
                .coverColor(request.getCoverColor())
                .checklist(new ArrayList<>())
                .comments(new ArrayList<>())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        Task saved = taskRepository.save(task);

        // Update board's column cardIds list
        boardRepository.findById(request.getBoardId()).ifPresent(board -> {
            for (BoardColumn col : board.getColumns()) {
                if (col.getId().equals(request.getColumnId())) {
                    if (col.getCardIds() == null) col.setCardIds(new ArrayList<>());
                    if (!col.getCardIds().contains(saved.getId())) {
                        col.getCardIds().add(saved.getId());
                    }
                    boardRepository.save(board);
                    break;
                }
            }
        });

        // Publish event to Kafka
        taskEventProducer.sendTaskEvent(saved, TaskEventType.TASK_CREATED, "system", "New task created: " + saved.getTitle());

        return saved;
    }

    public Task updateTask(String id, TaskDto.UpdateTaskRequest request) {
        Task task = getTaskById(id);

        if (request.getTitle() != null) task.setTitle(request.getTitle());
        if (request.getDescription() != null) task.setDescription(request.getDescription());
        if (request.getPriority() != null) task.setPriority(request.getPriority());
        if (request.getLabels() != null) task.setLabels(request.getLabels());
        if (request.getAssignees() != null) task.setAssignees(request.getAssignees());
        if (request.getDueDate() != null) task.setDueDate(request.getDueDate());
        if (request.getEstimatedHours() != null) task.setEstimatedHours(request.getEstimatedHours());
        if (request.getCoverColor() != null) task.setCoverColor(request.getCoverColor());

        task.setUpdatedAt(Instant.now());
        Task updated = taskRepository.save(task);

        // Publish event to Kafka
        taskEventProducer.sendTaskEvent(updated, TaskEventType.TASK_UPDATED, "system", "Task details updated: " + updated.getTitle());

        return updated;
    }

    public Task moveTask(String id, TaskDto.MoveTaskRequest request) {
        Task task = getTaskById(id);
        String oldColumnId = task.getColumnId();
        String newColumnId = request.getTargetColumnId();

        task.setColumnId(newColumnId);
        task.setUpdatedAt(Instant.now());
        Task saved = taskRepository.save(task);

        // Update column card lists in Board document
        boardRepository.findById(task.getBoardId()).ifPresent(board -> {
            for (BoardColumn col : board.getColumns()) {
                if (col.getCardIds() != null) {
                    col.getCardIds().remove(id);
                }
            }
            for (BoardColumn col : board.getColumns()) {
                if (col.getId().equals(newColumnId)) {
                    if (col.getCardIds() == null) col.setCardIds(new ArrayList<>());
                    int targetIdx = request.getTargetIndex() != null ? request.getTargetIndex() : col.getCardIds().size();
                    targetIdx = Math.min(Math.max(0, targetIdx), col.getCardIds().size());
                    col.getCardIds().add(targetIdx, id);
                    break;
                }
            }
            boardRepository.save(board);
        });

        // Publish event to Kafka
        taskEventProducer.sendTaskEvent(saved, TaskEventType.TASK_MOVED, "system", "Task moved from " + oldColumnId + " to " + newColumnId);

        return saved;
    }

    public void deleteTask(String id) {
        Task task = getTaskById(id);
        boardRepository.findById(task.getBoardId()).ifPresent(board -> {
            for (BoardColumn col : board.getColumns()) {
                if (col.getCardIds() != null) {
                    col.getCardIds().remove(id);
                }
            }
            boardRepository.save(board);
        });
        taskRepository.delete(task);

        // Publish event to Kafka
        taskEventProducer.sendTaskEvent(task, TaskEventType.TASK_DELETED, "system", "Task deleted: " + task.getTitle());
    }

    public Task addComment(String taskId, TaskDto.AddCommentRequest request, Assignee author) {
        Task task = getTaskById(taskId);
        Comment comment = Comment.builder()
                .id(UUID.randomUUID().toString())
                .author(author)
                .text(request.getText())
                .createdAt(Instant.now())
                .build();

        if (task.getComments() == null) {
            task.setComments(new ArrayList<>());
        }
        task.getComments().add(comment);
        task.setUpdatedAt(Instant.now());
        return taskRepository.save(task);
    }

    public Task addChecklistItem(String taskId, TaskDto.AddChecklistItemRequest request) {
        Task task = getTaskById(taskId);
        ChecklistItem item = ChecklistItem.builder()
                .id(UUID.randomUUID().toString())
                .text(request.getText())
                .completed(false)
                .build();

        if (task.getChecklist() == null) {
            task.setChecklist(new ArrayList<>());
        }
        task.getChecklist().add(item);
        task.setUpdatedAt(Instant.now());
        return taskRepository.save(task);
    }

    public Task toggleChecklistItem(String taskId, String itemId, boolean completed) {
        Task task = getTaskById(taskId);
        if (task.getChecklist() != null) {
            for (ChecklistItem item : task.getChecklist()) {
                if (item.getId().equals(itemId)) {
                    item.setCompleted(completed);
                    break;
                }
            }
            task.setUpdatedAt(Instant.now());
            return taskRepository.save(task);
        }
        return task;
    }
}
