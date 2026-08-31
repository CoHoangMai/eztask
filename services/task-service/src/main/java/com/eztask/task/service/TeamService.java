package com.eztask.task.service;

import com.eztask.task.dto.TeamDto;
import com.eztask.task.model.Team;
import com.eztask.task.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class TeamService {

    private final TeamRepository teamRepository;

    public List<Team> getTeamsByWorkspace(String workspaceId) {
        return teamRepository.findByWorkspaceId(workspaceId);
    }

    public Team getTeamById(String id) {
        return teamRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Team not found with id: " + id));
    }

    public Team createTeam(TeamDto.CreateTeamRequest request) {
        Team team = Team.builder()
                .workspaceId(request.getWorkspaceId())
                .name(request.getName())
                .description(request.getDescription())
                .color(request.getColor() != null ? request.getColor() : "#3b82f6")
                .icon(request.getIcon())
                .memberIds(request.getMemberIds() != null ? request.getMemberIds() : new ArrayList<>())
                .createdAt(Instant.now())
                .build();

        return teamRepository.save(team);
    }

    public Team updateTeam(String id, TeamDto.UpdateTeamRequest request) {
        Team team = getTeamById(id);
        if (request.getName() != null) team.setName(request.getName());
        if (request.getDescription() != null) team.setDescription(request.getDescription());
        if (request.getColor() != null) team.setColor(request.getColor());
        if (request.getIcon() != null) team.setIcon(request.getIcon());
        if (request.getMemberIds() != null) team.setMemberIds(request.getMemberIds());
        return teamRepository.save(team);
    }

    public void deleteTeam(String id) {
        Team team = getTeamById(id);
        teamRepository.delete(team);
    }

    public Team addMemberToTeam(String teamId, String userId) {
        Team team = getTeamById(teamId);
        if (!team.getMemberIds().contains(userId)) {
            team.getMemberIds().add(userId);
            return teamRepository.save(team);
        }
        return team;
    }

    public Team removeMemberFromTeam(String teamId, String userId) {
        Team team = getTeamById(teamId);
        team.getMemberIds().remove(userId);
        return teamRepository.save(team);
    }
}
