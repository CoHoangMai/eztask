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
public class BoardColumn {
    private String id;
    private String title;
    @Builder.Default
    private List<String> cardIds = new ArrayList<>();
    private Integer limit;
    private String colorAccent;
}
