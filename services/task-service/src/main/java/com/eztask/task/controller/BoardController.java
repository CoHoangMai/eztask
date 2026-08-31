package com.eztask.task.controller;

import com.eztask.task.dto.BoardDto;
import com.eztask.task.model.Board;
import com.eztask.task.security.UserPrincipal;
import com.eztask.task.service.BoardService;
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
@RequestMapping("/api/boards")
@RequiredArgsConstructor
@Tag(name = "Board Management", description = "Endpoints for Kanban board management")
@SecurityRequirement(name = "BearerAuth")
public class BoardController {

    private final BoardService boardService;

    @GetMapping
    @Operation(summary = "Get all boards or boards for a specific workspace")
    public ResponseEntity<List<Board>> getAllBoards(
            @RequestParam(required = false) String workspaceId,
            @AuthenticationPrincipal UserPrincipal principal) {
        String userId = principal != null ? principal.getId() : null;
        return ResponseEntity.ok(boardService.getAllBoards(workspaceId, userId));
    }

    @GetMapping("/default")
    @Operation(summary = "Get or initialize default demo board")
    public ResponseEntity<Board> getDefaultBoard(
            @RequestParam(required = false) String workspaceId,
            @AuthenticationPrincipal UserPrincipal principal) {
        String userId = principal != null ? principal.getId() : null;
        List<Board> boards = boardService.getAllBoards(workspaceId, userId);
        if (boards.isEmpty()) {
            return ResponseEntity.ok(boardService.createDefaultBoard(workspaceId));
        }
        return ResponseEntity.ok(boards.get(0));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get board by ID")
    public ResponseEntity<Board> getBoardById(@PathVariable String id) {
        return ResponseEntity.ok(boardService.getBoardById(id));
    }

    @PostMapping
    @Operation(summary = "Create a new board")
    public ResponseEntity<Board> createBoard(
            @Valid @RequestBody BoardDto.CreateBoardRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        String ownerId = principal != null ? principal.getId() : "system";
        return ResponseEntity.ok(boardService.createBoard(request, ownerId));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update board metadata or columns")
    public ResponseEntity<Board> updateBoard(
            @PathVariable String id,
            @RequestBody BoardDto.UpdateBoardRequest request) {
        return ResponseEntity.ok(boardService.updateBoard(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete board and its tasks")
    public ResponseEntity<Void> deleteBoard(@PathVariable String id) {
        boardService.deleteBoard(id);
        return ResponseEntity.noContent().build();
    }
}
