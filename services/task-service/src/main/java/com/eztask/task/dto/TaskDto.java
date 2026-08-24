package com.eztask.task.dto;

import com.eztask.task.model.Assignee;
import com.eztask.task.model.Label;
import com.eztask.task.model.TaskPriority;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

public class TaskDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateTaskRequest {
        @NotBlank(message = "Board ID is required")
        private String boardId;

        @NotBlank(message = "Column ID is required")
        private String columnId;

        @NotBlank(message = "Title is required")
        private String title;

        private String description;
        private TaskPriority priority;
        private List<Label> labels;
        private List<Assignee> assignees;
        private Instant dueDate;
        private Double estimatedHours;
        private String coverColor;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateTaskRequest {
        private String title;
        private String description;
        private TaskPriority priority;
        private List<Label> labels;
        private List<Assignee> assignees;
        private Instant dueDate;
        private Double estimatedHours;
        private String coverColor;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MoveTaskRequest {
        @NotBlank(message = "Target Column ID is required")
        private String targetColumnId;
        private Integer targetIndex;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AddCommentRequest {
        @NotBlank(message = "Comment text is required")
        private String text;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AddChecklistItemRequest {
        @NotBlank(message = "Item text is required")
        private String text;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ToggleChecklistRequest {
        private boolean completed;
    }
}
