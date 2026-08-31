package com.eztask.task.controller;

import com.eztask.task.dto.WorkspaceDto;
import com.eztask.task.model.Workspace;
import com.eztask.task.security.UserPrincipal;
import com.eztask.task.service.WorkspaceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workspaces")
@RequiredArgsConstructor
@Tag(name = "Workspace Management", description = "Endpoints for Multi-Tenant Workspace & Member Management")
@SecurityRequirement(name = "BearerAuth")
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    @GetMapping
    @Operation(summary = "Get all workspaces for current user")
    public ResponseEntity<List<Workspace>> getAllWorkspaces(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal != null) {
            return ResponseEntity.ok(workspaceService.getWorkspacesForUser(principal.getId()));
        }
        return ResponseEntity.ok(workspaceService.getAllWorkspaces());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get workspace details by ID")
    public ResponseEntity<Workspace> getWorkspaceById(@PathVariable String id) {
        return ResponseEntity.ok(workspaceService.getWorkspaceById(id));
    }

    @PostMapping
    @Operation(summary = "Create a new workspace")
    public ResponseEntity<Workspace> createWorkspace(
            @Valid @RequestBody WorkspaceDto.CreateWorkspaceRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        String ownerId = principal != null ? principal.getId() : "system";
        return ResponseEntity.ok(workspaceService.createWorkspace(request, ownerId));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update workspace metadata")
    public ResponseEntity<Workspace> updateWorkspace(
            @PathVariable String id,
            @RequestBody WorkspaceDto.UpdateWorkspaceRequest request) {
        return ResponseEntity.ok(workspaceService.updateWorkspace(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete workspace")
    public ResponseEntity<Void> deleteWorkspace(@PathVariable String id) {
        workspaceService.deleteWorkspace(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/members")
    @Operation(summary = "Add member to workspace")
    public ResponseEntity<Workspace> addMember(
            @PathVariable String id,
            @Valid @RequestBody WorkspaceDto.AddMemberRequest request) {
        return ResponseEntity.ok(workspaceService.addMember(id, request));
    }

    @PutMapping("/{id}/members/{userId}")
    @Operation(summary = "Update workspace member role and board permissions")
    public ResponseEntity<Workspace> updateMemberRole(
            @PathVariable String id,
            @PathVariable String userId,
            @Valid @RequestBody WorkspaceDto.UpdateMemberRoleRequest request) {
        return ResponseEntity.ok(workspaceService.updateMemberRole(id, userId, request));
    }

    @DeleteMapping("/{id}/members/{userId}")
    @Operation(summary = "Remove member from workspace")
    public ResponseEntity<Workspace> removeMember(
            @PathVariable String id,
            @PathVariable String userId) {
        return ResponseEntity.ok(workspaceService.removeMember(id, userId));
    }
}