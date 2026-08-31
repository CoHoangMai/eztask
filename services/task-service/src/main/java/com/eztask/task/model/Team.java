package com.eztask.task.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "teams")
public class Team {

    @Id
    private String id;

    @Indexed
    private String workspaceId;

    private String name;

    private String description;

    @Builder.Default
    private String color = "#3b82f6";

    private String icon;

    @Builder.Default
    private List<String> memberIds = new ArrayList<>();

    @CreatedDate
    @Builder.Default
    private Instant createdAt = Instant.now();
}
