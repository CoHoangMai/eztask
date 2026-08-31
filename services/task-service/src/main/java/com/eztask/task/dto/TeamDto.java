package com.eztask.task.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class TeamDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateTeamRequest {
        @NotBlank(message = "Workspace ID is required")
        private String workspaceId;

        @NotBlank(message = "Name is required")
        private String name;

        private String description;
        private String color;
        private String icon;
        private List<String> memberIds;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateTeamRequest {
        private String name;
        private String description;
        private String color;
        private String icon;
        private List<String> memberIds;
    }
}
