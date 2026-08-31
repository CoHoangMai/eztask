package com.eztask.task.service;

import com.eztask.task.dto.BoardDto;
import com.eztask.task.model.*;
import com.eztask.task.repository.BoardRepository;
import com.eztask.task.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class BoardService {

    private final BoardRepository boardRepository;
    private final TaskRepository taskRepository;

    public List<Board> getAllBoards(String workspaceId) {
        return getAllBoards(workspaceId, null);
    }

    public List<Board> getAllBoards(String workspaceId, String userId) {
        List<Board> boards;
        if (workspaceId != null && !workspaceId.isBlank()) {
            boards = boardRepository.findByWorkspaceId(workspaceId);
        } else {
            boards = boardRepository.findAll();
        }

        if (userId == null || userId.isBlank() || "system".equalsIgnoreCase(userId)) {
            return boards;
        }

        return boards.stream()
                .filter(b -> {
                    boolean isOwner = userId.equals(b.getOwnerId());
                    boolean isMember = b.getMemberIds() != null && b.getMemberIds().contains(userId);
                    boolean isWorkspaceVisible = "workspace".equalsIgnoreCase(b.getVisibility()) &&
                            (b.getMemberIds() == null || b.getMemberIds().isEmpty() || b.getMemberIds().contains(userId));
                    return isOwner || isMember || isWorkspaceVisible;
                })
                .toList();
    }

    public List<Board> getBoardsForUserInWorkspace(String workspaceId, String userId, String userRole, List<String> allowedBoardIds) {
        if ("guest".equalsIgnoreCase(userRole)) {
            if (allowedBoardIds == null || allowedBoardIds.isEmpty()) {
                return new ArrayList<>();
            }
            return boardRepository.findByWorkspaceIdAndIdIn(workspaceId, allowedBoardIds);
        }
        return boardRepository.findByWorkspaceId(workspaceId);
    }

    public Board getBoardById(String id) {
        return boardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Board not found with id: " + id));
    }

    public Board createBoard(BoardDto.CreateBoardRequest request, String ownerId) {
        List<BoardColumn> columns = request.getColumns();
        if (columns == null || columns.isEmpty()) {
            columns = getDefaultColumns();
        }

        Board board = Board.builder()
                .workspaceId(request.getWorkspaceId() != null ? request.getWorkspaceId() : "ws-apex-cloud")
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory() != null ? request.getCategory() : "product")
                .visibility(request.getVisibility() != null ? request.getVisibility() : "workspace")
                .teamId(request.getTeamId())
                .memberIds(request.getMemberIds() != null ? request.getMemberIds() : new ArrayList<>())
                .columns(columns)
                .ownerId(ownerId)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        return boardRepository.save(board);
    }

    public Board updateBoard(String id, BoardDto.UpdateBoardRequest request) {
        Board board = getBoardById(id);
        if (request.getTitle() != null) board.setTitle(request.getTitle());
        if (request.getDescription() != null) board.setDescription(request.getDescription());
        if (request.getCategory() != null) board.setCategory(request.getCategory());
        if (request.getVisibility() != null) board.setVisibility(request.getVisibility());
        if (request.getTeamId() != null) board.setTeamId(request.getTeamId());
        if (request.getMemberIds() != null) board.setMemberIds(request.getMemberIds());
        if (request.getColumns() != null) board.setColumns(request.getColumns());
        board.setUpdatedAt(Instant.now());
        return boardRepository.save(board);
    }

    public void deleteBoard(String id) {
        Board board = getBoardById(id);
        taskRepository.deleteByBoardId(board.getId());
        boardRepository.delete(board);
    }

    public Board createDefaultBoard(String workspaceId) {
        Board board = Board.builder()
                .id("board-default")
                .workspaceId(workspaceId != null ? workspaceId : "ws-apex-cloud")
                .title("Core Platform Sprint 42")
                .description("Production release sprint for microservices architecture and observability stack.")
                .category("product")
                .visibility("workspace")
                .columns(getDefaultColumns())
                .ownerId("system")
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        return boardRepository.save(board);
    }

    private List<BoardColumn> getDefaultColumns() {
        return List.of(
                BoardColumn.builder().id("col-backlog").title("Backlog").cardIds(new ArrayList<>()).colorAccent("#64748b").build(),
                BoardColumn.builder().id("col-todo").title("To Do").cardIds(new ArrayList<>()).colorAccent("#3b82f6").build(),
                BoardColumn.builder().id("col-in-progress").title("In Progress").cardIds(new ArrayList<>()).limit(5).colorAccent("#f59e0b").build(),
                BoardColumn.builder().id("col-review").title("Code Review").cardIds(new ArrayList<>()).limit(4).colorAccent("#8b5cf6").build(),
                BoardColumn.builder().id("col-done").title("Done").cardIds(new ArrayList<>()).colorAccent("#10b981").build()
        );
    }
}
