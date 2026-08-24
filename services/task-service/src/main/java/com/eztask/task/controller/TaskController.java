package com.eztask.task.controller;

import com.eztask.task.dto.TaskDto;
import com.eztask.task.model.Assignee;
import com.eztask.task.model.Task;
import com.eztask.task.security.UserPrincipal;
import com.eztask.task.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@Tag(name = "Task Management", description = "Endpoints for creating, updating, moving and commenting on tasks")
@SecurityRequirement(name = "BearerAuth")
public class TaskController {

    private final TaskService taskService;

    @GetMapping("/board/{boardId}")
    @Operation(summary = "Get all tasks for a specific board")
    public ResponseEntity<List<Task>> getTasksByBoard(@PathVariable String boardId) {
        return ResponseEntity.ok(taskService.getTasksByBoard(boardId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get task by ID")
    public ResponseEntity<Task> getTaskById(@PathVariable String id) {
        return ResponseEntity.ok(taskService.getTaskById(id));
    }

    @PostMapping
    @Operation(summary = "Create a new task")
    public ResponseEntity<Task> createTask(@Valid @RequestBody TaskDto.CreateTaskRequest request) {
        return ResponseEntity.ok(taskService.createTask(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update task details")
    public ResponseEntity<Task> updateTask(
            @PathVariable String id,
            @RequestBody TaskDto.UpdateTaskRequest request) {
        return ResponseEntity.ok(taskService.updateTask(id, request));
    }

    @PatchMapping("/{id}/move")
    @Operation(summary = "Move task to another column or position")
    public ResponseEntity<Task> moveTask(
            @PathVariable String id,
            @Valid @RequestBody TaskDto.MoveTaskRequest request) {
        return ResponseEntity.ok(taskService.moveTask(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete task")
    public ResponseEntity<Void> deleteTask(@PathVariable String id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/comments")
    @Operation(summary = "Add a comment to a task")
    public ResponseEntity<Task> addComment(
            @PathVariable String id,
            @Valid @RequestBody TaskDto.AddCommentRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        Assignee author = Assignee.builder()
                .id(principal != null ? principal.getId() : "anonymous")
                .name(principal != null ? principal.getName() : "Team Member")
                .email(principal != null ? principal.getEmail() : "member@taskflow.dev")
                .role(principal != null ? principal.getRole() : "Member")
                .avatar(principal != null ? principal.getAvatar() : null)
                .build();
        return ResponseEntity.ok(taskService.addComment(id, request, author));
    }

    @PostMapping("/{id}/checklist")
    @Operation(summary = "Add an item to task checklist")
    public ResponseEntity<Task> addChecklistItem(
            @PathVariable String id,
            @Valid @RequestBody TaskDto.AddChecklistItemRequest request) {
        return ResponseEntity.ok(taskService.addChecklistItem(id, request));
    }

    @PatchMapping("/{id}/checklist/{itemId}")
    @Operation(summary = "Toggle checklist item completion")
    public ResponseEntity<Task> toggleChecklist(
            @PathVariable String id,
            @PathVariable String itemId,
            @RequestBody TaskDto.ToggleChecklistRequest request) {
        return ResponseEntity.ok(taskService.toggleChecklistItem(id, itemId, request.isCompleted()));
    }
}
