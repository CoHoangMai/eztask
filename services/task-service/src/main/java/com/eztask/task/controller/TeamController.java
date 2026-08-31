package com.eztask.task.controller;

import com.eztask.task.dto.TeamDto;
import com.eztask.task.model.Team;
import com.eztask.task.service.TeamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
@Tag(name = "Team Management", description = "Endpoints for Department & Cross-functional Teams")
@SecurityRequirement(name = "BearerAuth")
public class TeamController {

    private final TeamService teamService;

    @GetMapping
    @Operation(summary = "Get teams for a workspace")
    public ResponseEntity<List<Team>> getTeamsByWorkspace(@RequestParam String workspaceId) {
        return ResponseEntity.ok(teamService.getTeamsByWorkspace(workspaceId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get team by ID")
    public ResponseEntity<Team> getTeamById(@PathVariable String id) {
        return ResponseEntity.ok(teamService.getTeamById(id));
    }

    @PostMapping
    @Operation(summary = "Create a new team")
    public ResponseEntity<Team> createTeam(@Valid @RequestBody TeamDto.CreateTeamRequest request) {
        return ResponseEntity.ok(teamService.createTeam(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update team information")
    public ResponseEntity<Team> updateTeam(
            @PathVariable String id,
            @RequestBody TeamDto.UpdateTeamRequest request) {
        return ResponseEntity.ok(teamService.updateTeam(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete team")
    public ResponseEntity<Void> deleteTeam(@PathVariable String id) {
        teamService.deleteTeam(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/members/{userId}")
    @Operation(summary = "Add member to team")
    public ResponseEntity<Team> addMemberToTeam(
            @PathVariable String id,
            @PathVariable String userId) {
        return ResponseEntity.ok(teamService.addMemberToTeam(id, userId));
    }

    @DeleteMapping("/{id}/members/{userId}")
    @Operation(summary = "Remove member from team")
    public ResponseEntity<Team> removeMemberFromTeam(
            @PathVariable String id,
            @PathVariable String userId) {
        return ResponseEntity.ok(teamService.removeMemberFromTeam(id, userId));
    }
}
