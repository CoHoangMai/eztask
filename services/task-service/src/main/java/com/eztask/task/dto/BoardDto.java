package com.eztask.task.dto;

import com.eztask.task.model.BoardColumn;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class BoardDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateBoardRequest {
        @NotBlank(message = "Title is required")
        private String title;

        private String workspaceId;
        private String description;
        private String category;
        private String visibility;
        private String teamId;
        private List<String> memberIds;
        private List<BoardColumn> columns;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateBoardRequest {
        private String title;
        private String workspaceId;
        private String description;
        private String category;
        private String visibility;
        private String teamId;
        private List<String> memberIds;
        private List<BoardColumn> columns;
    }
}
