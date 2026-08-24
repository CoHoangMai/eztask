package com.eztask.task.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "tasks")
public class Task {

    @Id
    private String id;

    private String boardId;

    private String columnId;

    private String title;

    private String description;

    @Builder.Default
    private TaskPriority priority = TaskPriority.MEDIUM;

    @Builder.Default
    private List<Label> labels = new ArrayList<>();

    @Builder.Default
    private List<Assignee> assignees = new ArrayList<>();

    private Instant dueDate;

    private Double estimatedHours;

    @Builder.Default
    private List<ChecklistItem> checklist = new ArrayList<>();

    @Builder.Default
    private List<Comment> comments = new ArrayList<>();

    private String coverColor;

    @CreatedDate
    @Builder.Default
    private Instant createdAt = Instant.now();

    @LastModifiedDate
    @Builder.Default
    private Instant updatedAt = Instant.now();
}
