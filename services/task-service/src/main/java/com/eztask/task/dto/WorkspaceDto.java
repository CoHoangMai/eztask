package com.eztask.task.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class WorkspaceDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateWorkspaceRequest {
        @NotBlank(message = "Name is required")
        private String name;

        private String slug;
        private String logo;
        private String description;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateWorkspaceRequest {
        private String name;
        private String logo;
        private String description;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AddMemberRequest {
        @NotBlank(message = "User ID is required")
        private String userId;

        @NotBlank(message = "Role is required")
        private String role; // owner, admin, member, guest

        private List<String> allowedBoardIds;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateMemberRoleRequest {
        @NotBlank(message = "Role is required")
        private String role;

        private List<String> allowedBoardIds;
    }
}
