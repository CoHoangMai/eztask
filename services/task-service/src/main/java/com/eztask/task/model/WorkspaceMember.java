package com.eztask.task.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkspaceMember {
    private String userId;
    
    @Builder.Default
    private String role = "member"; // "owner", "admin", "member", "guest"
    
    @Builder.Default
    private Instant joinedAt = Instant.now();

    @Builder.Default
    private List<String> allowedBoardIds = new ArrayList<>();
}
