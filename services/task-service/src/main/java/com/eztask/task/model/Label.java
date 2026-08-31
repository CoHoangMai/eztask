package com.eztask.task.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Label {
    private String id;
    private String workspaceId;
    private String name;
    private String color;
    private String bg;
    private String text;
    private String border;
    private String category;
}
