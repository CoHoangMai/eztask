package com.eztask.task.service;

import com.eztask.task.dto.WorkspaceDto;
import com.eztask.task.model.Workspace;
import com.eztask.task.model.WorkspaceMember;
import com.eztask.task.repository.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;

    public List<Workspace> getAllWorkspaces() {
        return workspaceRepository.findAll();
    }

    public List<Workspace> getWorkspacesForUser(String userId) {
        return workspaceRepository.findByMembersUserId(userId);
    }

    public Workspace getWorkspaceById(String id) {
        return workspaceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workspace not found with id: " + id));
    }

    public Workspace createWorkspace(WorkspaceDto.CreateWorkspaceRequest request, String ownerId) {
        String slug = request.getSlug() != null && !request.getSlug().isBlank()
                ? request.getSlug()
                : request.getName().toLowerCase().replaceAll("[^a-z0-9]+", "-");

        List<WorkspaceMember> initialMembers = new ArrayList<>();
        initialMembers.add(WorkspaceMember.builder()
                .userId(ownerId)
                .role("owner")
                .joinedAt(Instant.now())
                .allowedBoardIds(new ArrayList<>())
                .build());

        Workspace workspace = Workspace.builder()
                .name(request.getName())
                .slug(slug)
                .logo(request.getLogo() != null ? request.getLogo() : request.getName().substring(0, Math.min(2, request.getName().length())).toUpperCase())
                .description(request.getDescription())
                .ownerId(ownerId)
                .members(initialMembers)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        return workspaceRepository.save(workspace);
    }

    public Workspace updateWorkspace(String id, WorkspaceDto.UpdateWorkspaceRequest request) {
        Workspace workspace = getWorkspaceById(id);
        if (request.getName() != null) workspace.setName(request.getName());
        if (request.getLogo() != null) workspace.setLogo(request.getLogo());
        if (request.getDescription() != null) workspace.setDescription(request.getDescription());
        workspace.setUpdatedAt(Instant.now());
        return workspaceRepository.save(workspace);
    }

    public void deleteWorkspace(String id) {
        Workspace workspace = getWorkspaceById(id);
        workspaceRepository.delete(workspace);
    }

    public Workspace addMember(String workspaceId, WorkspaceDto.AddMemberRequest request) {
        Workspace workspace = getWorkspaceById(workspaceId);
        
        // Check if member already exists
        boolean exists = workspace.getMembers().stream()
                .anyMatch(m -> m.getUserId().equals(request.getUserId()));
        if (exists) {
            throw new IllegalArgumentException("User is already a member of this workspace");
        }

        WorkspaceMember member = WorkspaceMember.builder()
                .userId(request.getUserId())
                .role(request.getRole())
                .joinedAt(Instant.now())
                .allowedBoardIds(request.getAllowedBoardIds() != null ? request.getAllowedBoardIds() : new ArrayList<>())
                .build();

        workspace.getMembers().add(member);
        workspace.setUpdatedAt(Instant.now());
        return workspaceRepository.save(workspace);
    }

    public Workspace updateMemberRole(String workspaceId, String userId, WorkspaceDto.UpdateMemberRoleRequest request) {
        Workspace workspace = getWorkspaceById(workspaceId);
        
        Optional<WorkspaceMember> targetMember = workspace.getMembers().stream()
                .filter(m -> m.getUserId().equals(userId))
                .findFirst();

        if (targetMember.isEmpty()) {
            throw new RuntimeException("Member not found in workspace");
        }

        WorkspaceMember member = targetMember.get();
        member.setRole(request.getRole());
        if (request.getAllowedBoardIds() != null) {
            member.setAllowedBoardIds(request.getAllowedBoardIds());
        }

        workspace.setUpdatedAt(Instant.now());
        return workspaceRepository.save(workspace);
    }

    public Workspace removeMember(String workspaceId, String userId) {
        Workspace workspace = getWorkspaceById(workspaceId);
        workspace.getMembers().removeIf(m -> m.getUserId().equals(userId));
        workspace.setUpdatedAt(Instant.now());
        return workspaceRepository.save(workspace);
    }
}
