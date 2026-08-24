package com.eztask.task.config;

import com.eztask.task.model.*;
import com.eztask.task.repository.BoardRepository;
import com.eztask.task.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
@SuppressWarnings("null")
public class DataInitializer implements CommandLineRunner {

    private final BoardRepository boardRepository;
    private final TaskRepository taskRepository;

    @Override
    public void run(String... args) {
        String boardId = "board-default";

        if (boardRepository.count() == 0) {
            log.info("Seeding initial Kanban Board...");

            List<BoardColumn> columns = List.of(
                    BoardColumn.builder().id("col-backlog").title("Backlog").cardIds(new ArrayList<>(List.of("task-1"))).colorAccent("#64748b").build(),
                    BoardColumn.builder().id("col-todo").title("To Do").cardIds(new ArrayList<>(List.of("task-2"))).colorAccent("#3b82f6").build(),
                    BoardColumn.builder().id("col-in-progress").title("In Progress").cardIds(new ArrayList<>(List.of("task-3"))).limit(5).colorAccent("#f59e0b").build(),
                    BoardColumn.builder().id("col-review").title("Code Review").cardIds(new ArrayList<>(List.of("task-4"))).limit(4).colorAccent("#8b5cf6").build(),
                    BoardColumn.builder().id("col-done").title("Done").cardIds(new ArrayList<>(List.of("task-5"))).colorAccent("#10b981").build()
            );

            Board board = Board.builder()
                    .id(boardId)
                    .title("Core Platform Sprint 42")
                    .description("Production release sprint for microservices architecture and observability stack.")
                    .category("product")
                    .columns(columns)
                    .ownerId("system")
                    .createdAt(Instant.now())
                    .updatedAt(Instant.now())
                    .build();

            boardRepository.save(board);
        }

        if (taskRepository.count() == 0) {
            log.info("Seeding sample Kanban Tasks into task_db...");

            // Assignees
            Assignee alex = Assignee.builder().id("usr-1").name("Alex Morgan").email("alex.morgan@taskflow.dev").role("Lead Architect").avatar("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150").build();
            Assignee sarah = Assignee.builder().id("usr-2").name("Sarah Chen").email("sarah.chen@taskflow.dev").role("Senior Developer").avatar("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150").build();

            // Labels
            Label backend = Label.builder().id("lbl-1").name("Backend").color("#3b82f6").bg("bg-blue-500/10").text("text-blue-400").border("border-blue-500/30").build();
            Label security = Label.builder().id("lbl-2").name("Security").color("#ef4444").bg("bg-rose-500/10").text("text-rose-400").border("border-rose-500/30").build();
            Label devops = Label.builder().id("lbl-3").name("DevOps").color("#10b981").bg("bg-emerald-500/10").text("text-emerald-400").border("border-emerald-500/30").build();

            Task task1 = Task.builder()
                    .id("task-1")
                    .boardId(boardId)
                    .columnId("col-backlog")
                    .title("Migrate Identity Service to PostgreSQL 16")
                    .description("Ensure high availability and ACID compliance for user authentication.")
                    .priority(TaskPriority.HIGH)
                    .labels(List.of(backend, security))
                    .assignees(List.of(alex))
                    .dueDate(Instant.now().plus(5, ChronoUnit.DAYS))
                    .estimatedHours(12.0)
                    .checklist(List.of(
                            ChecklistItem.builder().id("chk-1").text("Configure Docker Compose").completed(true).build(),
                            ChecklistItem.builder().id("chk-2").text("Verify Flyway migrations").completed(false).build()
                    ))
                    .comments(new ArrayList<>())
                    .build();

            Task task2 = Task.builder()
                    .id("task-2")
                    .boardId(boardId)
                    .columnId("col-todo")
                    .title("Implement Distributed JWT Auth in Task Service")
                    .description("Stateless token validation across all downstream services.")
                    .priority(TaskPriority.URGENT)
                    .labels(List.of(security, backend))
                    .assignees(List.of(sarah))
                    .dueDate(Instant.now().plus(2, ChronoUnit.DAYS))
                    .estimatedHours(8.0)
                    .checklist(new ArrayList<>())
                    .comments(new ArrayList<>())
                    .build();

            Task task3 = Task.builder()
                    .id("task-3")
                    .boardId(boardId)
                    .columnId("col-in-progress")
                    .title("Design Responsive Kanban Board UI")
                    .description("Drag and drop card mechanics with instant state updates.")
                    .priority(TaskPriority.MEDIUM)
                    .labels(List.of(backend, devops))
                    .assignees(List.of(alex, sarah))
                    .dueDate(Instant.now().plus(1, ChronoUnit.DAYS))
                    .estimatedHours(16.0)
                    .checklist(List.of(
                            ChecklistItem.builder().id("chk-3").text("Desktop and mobile layout").completed(true).build(),
                            ChecklistItem.builder().id("chk-4").text("Card move animation").completed(true).build()
                    ))
                    .comments(List.of(
                            Comment.builder().id("cmt-1").author(alex).text("Initial drag and drop prototype verified!").createdAt(Instant.now()).build()
                    ))
                    .build();

            taskRepository.saveAll(List.of(task1, task2, task3));
            log.info("Database seeding completed: sample Tasks successfully saved in MongoDB.");
        }
    }
}
