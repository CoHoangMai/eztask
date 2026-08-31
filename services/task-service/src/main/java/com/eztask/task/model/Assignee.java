package com.eztask.task.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Assignee {
    private String id;
    private String name;
    private String email;
    private String avatar;
    private String role;
    private String department;

    @Builder.Default
    private List<String> workspaceIds = new ArrayList<>();
}
