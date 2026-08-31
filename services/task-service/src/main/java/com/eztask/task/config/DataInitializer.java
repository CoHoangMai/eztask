package com.eztask.task.config;

import com.eztask.task.model.*;
import com.eztask.task.repository.BoardRepository;
import com.eztask.task.repository.TaskRepository;
import com.eztask.task.repository.TeamRepository;
import com.eztask.task.repository.WorkspaceRepository;
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

    private final WorkspaceRepository workspaceRepository;
    private final TeamRepository teamRepository;
    private final BoardRepository boardRepository;
    private final TaskRepository taskRepository;

    @Override
    public void run(String... args) {
        // 1. Seed Workspaces
        if (workspaceRepository.count() == 0) {
            log.info("Seeding initial Multi-tenant Workspaces...");

            Workspace apexWs = Workspace.builder()
                    .id("ws-apex-cloud")
                    .name("Apex Cloud Solutions")
                    .slug("apex-cloud")
                    .logo("AC")
                    .description("Enterprise Cloud Infrastructure, Kubernetes Platforms & DevOps automation.")
                    .ownerId("user-1")
                    .members(List.of(
                            WorkspaceMember.builder().userId("user-1").role("owner").joinedAt(Instant.now().minus(90, ChronoUnit.DAYS)).build(),
                            WorkspaceMember.builder().userId("user-2").role("admin").joinedAt(Instant.now().minus(80, ChronoUnit.DAYS)).build(),
                            WorkspaceMember.builder().userId("user-3").role("member").joinedAt(Instant.now().minus(60, ChronoUnit.DAYS)).build(),
                            WorkspaceMember.builder().userId("user-4").role("guest").joinedAt(Instant.now().minus(30, ChronoUnit.DAYS)).allowedBoardIds(List.of("board-apex-infra")).build(),
                            WorkspaceMember.builder().userId("user-5").role("member").joinedAt(Instant.now().minus(20, ChronoUnit.DAYS)).build()
                    ))
                    .createdAt(Instant.now().minus(90, ChronoUnit.DAYS))
                    .updatedAt(Instant.now())
                    .build();

            Workspace novaWs = Workspace.builder()
                    .id("ws-nova-fintech")
                    .name("Nova Fintech Inc")
                    .slug("nova-fintech")
                    .logo("NF")
                    .description("Core Banking API, Global Merchant Payments & PCI-DSS Financial Compliance.")
                    .ownerId("user-5")
                    .members(List.of(
                            WorkspaceMember.builder().userId("user-5").role("owner").joinedAt(Instant.now().minus(120, ChronoUnit.DAYS)).build(),
                            WorkspaceMember.builder().userId("user-1").role("admin").joinedAt(Instant.now().minus(100, ChronoUnit.DAYS)).build(),
                            WorkspaceMember.builder().userId("user-3").role("member").joinedAt(Instant.now().minus(90, ChronoUnit.DAYS)).build(),
                            WorkspaceMember.builder().userId("user-4").role("guest").joinedAt(Instant.now().minus(15, ChronoUnit.DAYS)).allowedBoardIds(List.of("board-nova-aml")).build()
                    ))
                    .createdAt(Instant.now().minus(120, ChronoUnit.DAYS))
                    .updatedAt(Instant.now())
                    .build();

            Workspace pulseWs = Workspace.builder()
                    .id("ws-studio-pulse")
                    .name("Studio Pulse Creative")
                    .slug("studio-pulse")
                    .logo("SP")
                    .description("Boutique Brand Design, Digital Art Direction & UI/UX Product Design Systems.")
                    .ownerId("user-2")
                    .members(List.of(
                            WorkspaceMember.builder().userId("user-2").role("owner").joinedAt(Instant.now().minus(45, ChronoUnit.DAYS)).build(),
                            WorkspaceMember.builder().userId("user-1").role("member").joinedAt(Instant.now().minus(40, ChronoUnit.DAYS)).build(),
                            WorkspaceMember.builder().userId("user-3").role("member").joinedAt(Instant.now().minus(35, ChronoUnit.DAYS)).build()
                    ))
                    .createdAt(Instant.now().minus(45, ChronoUnit.DAYS))
                    .updatedAt(Instant.now())
                    .build();

            Workspace quantumWs = Workspace.builder()
                    .id("ws-quantum-labs")
                    .name("Quantum Edge Labs")
                    .slug("quantum-edge")
                    .logo("QE")
                    .description("Next-generation Edge AI Models, Tensor Processing & Hardware Acceleration Research.")
                    .ownerId("user-1")
                    .members(List.of(
                            WorkspaceMember.builder().userId("user-1").role("owner").joinedAt(Instant.now().minus(10, ChronoUnit.DAYS)).build(),
                            WorkspaceMember.builder().userId("user-2").role("admin").joinedAt(Instant.now().minus(8, ChronoUnit.DAYS)).build(),
                            WorkspaceMember.builder().userId("user-3").role("member").joinedAt(Instant.now().minus(5, ChronoUnit.DAYS)).build()
                    ))
                    .createdAt(Instant.now().minus(10, ChronoUnit.DAYS))
                    .updatedAt(Instant.now())
                    .build();

            workspaceRepository.saveAll(List.of(apexWs, novaWs, pulseWs, quantumWs));
            log.info("Multi-tenant Workspaces successfully seeded in MongoDB.");
        }

        // 2. Seed Teams
        if (teamRepository.count() == 0) {
            log.info("Seeding initial Teams...");

            List<Team> teams = List.of(
                    Team.builder().id("team-apex-devops").workspaceId("ws-apex-cloud").name("DevOps & Cloud Platform").description("Infrastructure as Code, Kubernetes cluster operations, and CI/CD pipelines.").color("#3b82f6").icon("Cloud").memberIds(List.of("user-1", "user-3")).build(),
                    Team.builder().id("team-apex-sec").workspaceId("ws-apex-cloud").name("Security & IAM Architecture").description("Zero-trust network architecture, penetration testing, and identity management.").color("#ef4444").icon("Shield").memberIds(List.of("user-1", "user-2", "user-4")).build(),
                    Team.builder().id("team-apex-talent").workspaceId("ws-apex-cloud").name("People Ops & Talent Acquisition").description("Global tech recruiting, onboarding pipelines, and organizational growth.").color("#8b5cf6").icon("UserCheck").memberIds(List.of("user-5", "user-2")).build(),
                    Team.builder().id("team-nova-core").workspaceId("ws-nova-fintech").name("Core Transaction Processing").description("High-throughput settlement engines, payment gateways, and banking APIs.").color("#10b981").icon("DollarSign").memberIds(List.of("user-5", "user-1")).build(),
                    Team.builder().id("team-nova-risk").workspaceId("ws-nova-fintech").name("Risk & Compliance Unit").description("Anti-money laundering detection, KYC automation, and regulatory reporting.").color("#f59e0b").icon("Shield").memberIds(List.of("user-3", "user-4")).build(),
                    Team.builder().id("team-pulse-design").workspaceId("ws-studio-pulse").name("Design Systems & Visual Identity").description("Multi-brand component libraries, token systems, and interaction design.").color("#ec4899").icon("Palette").memberIds(List.of("user-2", "user-3")).build()
            );

            teamRepository.saveAll(teams);
            log.info("Teams successfully seeded in MongoDB.");
        }

        // 3. Seed Boards
        if (boardRepository.count() == 0) {
            log.info("Seeding initial Kanban Boards...");

            Board apexSprintBoard = Board.builder()
                    .id("board-apex-sprint")
                    .workspaceId("ws-apex-cloud")
                    .teamId("team-apex-devops")
                    .title("Engineering Sprint 42")
                    .description("Core platform deliverables, distributed microservices refactoring, and real-time observability.")
                    .category("product")
                    .visibility("workspace")
                    .ownerId("user-1")
                    .columns(List.of(
                            BoardColumn.builder().id("col-backlog").title("Backlog").cardIds(new ArrayList<>(List.of("task-101", "task-102"))).colorAccent("#64748b").build(),
                            BoardColumn.builder().id("col-todo").title("To Do").cardIds(new ArrayList<>(List.of("task-103", "task-104"))).colorAccent("#3b82f6").build(),
                            BoardColumn.builder().id("col-in-progress").title("In Progress").cardIds(new ArrayList<>(List.of("task-105", "task-106"))).limit(4).colorAccent("#f59e0b").build(),
                            BoardColumn.builder().id("col-review").title("Code Review").cardIds(new ArrayList<>(List.of("task-107"))).limit(3).colorAccent("#8b5cf6").build(),
                            BoardColumn.builder().id("col-done").title("Done").cardIds(new ArrayList<>(List.of("task-108"))).colorAccent("#10b981").build()
                    ))
                    .createdAt(Instant.now().minus(14, ChronoUnit.DAYS))
                    .updatedAt(Instant.now())
                    .build();

            Board apexInfraBoard = Board.builder()
                    .id("board-apex-infra")
                    .workspaceId("ws-apex-cloud")
                    .teamId("team-apex-sec")
                    .title("Kubernetes & Cloud Infrastructure")
                    .description("Multi-region AWS EKS clusters, VPC peering, Istio service mesh, and TLS automation.")
                    .category("operations")
                    .visibility("workspace")
                    .ownerId("user-1")
                    .columns(List.of(
                            BoardColumn.builder().id("col-infra-todo").title("Provisioning Queue").cardIds(new ArrayList<>(List.of("task-201"))).colorAccent("#3b82f6").build(),
                            BoardColumn.builder().id("col-infra-active").title("Active Deployment").cardIds(new ArrayList<>(List.of("task-202"))).colorAccent("#f59e0b").build(),
                            BoardColumn.builder().id("col-infra-audit").title("Security Hardening").cardIds(new ArrayList<>(List.of("task-203"))).colorAccent("#8b5cf6").build(),
                            BoardColumn.builder().id("col-infra-live").title("Production Live").cardIds(new ArrayList<>()).colorAccent("#10b981").build()
                    ))
                    .createdAt(Instant.now().minus(20, ChronoUnit.DAYS))
                    .updatedAt(Instant.now())
                    .build();

            Board apexTalentBoard = Board.builder()
                    .id("board-apex-talent")
                    .workspaceId("ws-apex-cloud")
                    .teamId("team-apex-talent")
                    .title("Q3 Talent & Engineering Hiring")
                    .description("Candidate tracking for Staff Security Engineer, Staff Distributed Systems, and Principal UX.")
                    .category("recruiting")
                    .visibility("workspace")
                    .ownerId("user-5")
                    .columns(List.of(
                            BoardColumn.builder().id("col-talent-screen").title("Sourced Candidates").cardIds(new ArrayList<>(List.of("task-301"))).colorAccent("#64748b").build(),
                            BoardColumn.builder().id("col-talent-tech").title("Technical Interview").cardIds(new ArrayList<>(List.of("task-302"))).colorAccent("#3b82f6").build(),
                            BoardColumn.builder().id("col-talent-offer").title("Offer Negotiation").cardIds(new ArrayList<>(List.of("task-303"))).colorAccent("#f59e0b").build(),
                            BoardColumn.builder().id("col-talent-hired").title("Hired & Onboarded").cardIds(new ArrayList<>()).colorAccent("#10b981").build()
                    ))
                    .createdAt(Instant.now().minus(25, ChronoUnit.DAYS))
                    .updatedAt(Instant.now())
                    .build();

            Board novaCoreBoard = Board.builder()
                    .id("board-nova-core")
                    .workspaceId("ws-nova-fintech")
                    .teamId("team-nova-core")
                    .title("Core Payment Gateway v3")
                    .description("Low-latency card processing router, tokenization engine, and ISO 8583 settlement adapter.")
                    .category("product")
                    .visibility("workspace")
                    .ownerId("user-5")
                    .columns(List.of(
                            BoardColumn.builder().id("col-nova-backlog").title("Specifications").cardIds(new ArrayList<>(List.of("task-401"))).colorAccent("#64748b").build(),
                            BoardColumn.builder().id("col-nova-dev").title("Engine Development").cardIds(new ArrayList<>(List.of("task-402"))).colorAccent("#3b82f6").build(),
                            BoardColumn.builder().id("col-nova-qa").title("Sandbox Sandbox QA").cardIds(new ArrayList<>(List.of("task-403"))).colorAccent("#f59e0b").build(),
                            BoardColumn.builder().id("col-nova-settled").title("Production Settled").cardIds(new ArrayList<>()).colorAccent("#10b981").build()
                    ))
                    .createdAt(Instant.now().minus(30, ChronoUnit.DAYS))
                    .updatedAt(Instant.now())
                    .build();

            Board novaAmlBoard = Board.builder()
                    .id("board-nova-aml")
                    .workspaceId("ws-nova-fintech")
                    .teamId("team-nova-risk")
                    .title("Compliance & AML Audit 2026")
                    .description("SOC 2 Type II audit, FinCEN regulatory filings, and automated PEP sanction list screening.")
                    .category("operations")
                    .visibility("workspace")
                    .ownerId("user-5")
                    .columns(List.of(
                            BoardColumn.builder().id("col-aml-prep").title("Audit Preparation").cardIds(new ArrayList<>(List.of("task-501"))).colorAccent("#64748b").build(),
                            BoardColumn.builder().id("col-aml-evidence").title("Evidence Gathering").cardIds(new ArrayList<>(List.of("task-502"))).colorAccent("#3b82f6").build(),
                            BoardColumn.builder().id("col-aml-review").title("Auditor Review").cardIds(new ArrayList<>(List.of("task-503"))).colorAccent("#8b5cf6").build(),
                            BoardColumn.builder().id("col-aml-certified").title("Audit Certified").cardIds(new ArrayList<>()).colorAccent("#10b981").build()
                    ))
                    .createdAt(Instant.now().minus(15, ChronoUnit.DAYS))
                    .updatedAt(Instant.now())
                    .build();

            Board pulseBrandBoard = Board.builder()
                    .id("board-pulse-brand")
                    .workspaceId("ws-studio-pulse")
                    .teamId("team-pulse-design")
                    .title("Global Brand Redesign 2026")
                    .description("Modernizing visual identity, typography system, 3D asset pipeline, and digital brand guidelines.")
                    .category("design")
                    .visibility("workspace")
                    .ownerId("user-2")
                    .columns(List.of(
                            BoardColumn.builder().id("col-pulse-concept").title("Concept Exploration").cardIds(new ArrayList<>(List.of("task-601"))).colorAccent("#64748b").build(),
                            BoardColumn.builder().id("col-pulse-design").title("Design Execution").cardIds(new ArrayList<>(List.of("task-602"))).colorAccent("#ec4899").build(),
                            BoardColumn.builder().id("col-pulse-stakeholder").title("Executive Review").cardIds(new ArrayList<>(List.of("task-603"))).colorAccent("#8b5cf6").build(),
                            BoardColumn.builder().id("col-pulse-approved").title("Final Approved").cardIds(new ArrayList<>()).colorAccent("#10b981").build()
                    ))
                    .createdAt(Instant.now().minus(20, ChronoUnit.DAYS))
                    .updatedAt(Instant.now())
                    .build();

            boardRepository.saveAll(List.of(apexSprintBoard, apexInfraBoard, apexTalentBoard, novaCoreBoard, novaAmlBoard, pulseBrandBoard));
            log.info("Boards successfully seeded in MongoDB.");
        }

        // 4. Seed Sample Tasks
        if (taskRepository.count() == 0) {
            log.info("Seeding comprehensive Tasks for multi-workspace structure...");

            Assignee alex = Assignee.builder().id("user-1").name("Alex Morgan").email("alex.morgan@eztask.dev").role("Lead Architect").department("Engineering").workspaceIds(List.of("ws-apex-cloud", "ws-nova-fintech", "ws-studio-pulse", "ws-quantum-labs")).avatar("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150").build();
            Assignee sarah = Assignee.builder().id("user-2").name("Sarah Chen").email("sarah.chen@eztask.dev").role("Product Designer").department("Design").workspaceIds(List.of("ws-apex-cloud", "ws-studio-pulse", "ws-quantum-labs")).avatar("https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150").build();
            Assignee marcus = Assignee.builder().id("user-3").name("Marcus Vance").email("marcus.vance@eztask.dev").role("Senior Backend Dev").department("Engineering").workspaceIds(List.of("ws-apex-cloud", "ws-nova-fintech", "ws-studio-pulse", "ws-quantum-labs")).avatar("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150").build();
            Assignee elena = Assignee.builder().id("user-4").name("Elena Rostova").email("elena.rostova@external-audit.com").role("External Auditor").department("Audit & Security").workspaceIds(List.of("ws-apex-cloud", "ws-nova-fintech")).avatar("https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150").build();
            Assignee david = Assignee.builder().id("user-5").name("David Kim").email("david.kim@eztask.dev").role("Head of Engineering").department("Management").workspaceIds(List.of("ws-apex-cloud", "ws-nova-fintech")).avatar("https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150").build();

            Label backendLbl = Label.builder().id("lbl-1").workspaceId("ws-apex-cloud").name("Backend").color("#3b82f6").bg("bg-blue-500/10").text("text-blue-400").border("border-blue-500/30").category("Technical").build();
            Label securityLbl = Label.builder().id("lbl-2").workspaceId("ws-apex-cloud").name("Security").color("#ef4444").bg("bg-rose-500/10").text("text-rose-400").border("border-rose-500/30").category("Security").build();
            Label devopsLbl = Label.builder().id("lbl-3").workspaceId("ws-apex-cloud").name("DevOps").color("#10b981").bg("bg-emerald-500/10").text("text-emerald-400").border("border-emerald-500/30").category("Technical").build();
            Label databaseLbl = Label.builder().id("lbl-5").workspaceId("ws-apex-cloud").name("Database").color("#06b6d4").bg("bg-cyan-500/10").text("text-cyan-400").border("border-cyan-500/30").category("Technical").build();

            List<Task> tasks = List.of(
                    Task.builder().id("task-101").boardId("board-apex-sprint").columnId("col-backlog").title("Migrate Identity Service to PostgreSQL 16").description("Ensure high availability and ACID compliance for user authentication.").priority(TaskPriority.HIGH).labels(List.of(backendLbl, databaseLbl)).assignees(List.of(alex, marcus)).dueDate(Instant.now().plus(6, ChronoUnit.DAYS)).estimatedHours(14.0).checklist(List.of(ChecklistItem.builder().id("chk-1").text("Configure connection pool").completed(true).build())).comments(new ArrayList<>()).build(),
                    Task.builder().id("task-102").boardId("board-apex-sprint").columnId("col-backlog").title("Implement Distributed OpenTelemetry Tracing").description("Trace request lifecycles across API Gateway, Task Service, and Identity Service.").priority(TaskPriority.MEDIUM).labels(List.of(devopsLbl, backendLbl)).assignees(List.of(marcus)).dueDate(Instant.now().plus(8, ChronoUnit.DAYS)).estimatedHours(12.0).checklist(new ArrayList<>()).comments(new ArrayList<>()).build(),
                    Task.builder().id("task-103").boardId("board-apex-sprint").columnId("col-todo").title("Implement Multi-Tenant Workspace DB Partitioning").description("Isolate data collections by tenant workspace ID across all microservices.").priority(TaskPriority.URGENT).labels(List.of(securityLbl, backendLbl)).assignees(List.of(alex)).dueDate(Instant.now().plus(2, ChronoUnit.DAYS)).estimatedHours(16.0).checklist(List.of(ChecklistItem.builder().id("chk-2").text("Verify query indexing").completed(false).build())).comments(new ArrayList<>()).build(),
                    Task.builder().id("task-104").boardId("board-apex-sprint").columnId("col-todo").title("Design Role-Based Access Control (RBAC) Guard").description("Support Owner, Admin, Member, and Guest role matrix with board restriction.").priority(TaskPriority.HIGH).labels(List.of(securityLbl)).assignees(List.of(alex, david)).dueDate(Instant.now().plus(3, ChronoUnit.DAYS)).estimatedHours(10.0).checklist(new ArrayList<>()).comments(new ArrayList<>()).build(),
                    Task.builder().id("task-105").boardId("board-apex-sprint").columnId("col-in-progress").title("Task Service MongoDB Real-time Change Streams").description("Broadcast task events to SSE / WebSocket notification service.").priority(TaskPriority.HIGH).labels(List.of(backendLbl)).assignees(List.of(marcus)).dueDate(Instant.now().plus(1, ChronoUnit.DAYS)).estimatedHours(8.0).checklist(List.of(ChecklistItem.builder().id("chk-3").text("Integration tests").completed(true).build())).comments(new ArrayList<>()).build(),
                    Task.builder().id("task-106").boardId("board-apex-sprint").columnId("col-in-progress").title("Refactor Board Header & Responsive Layout").description("Support breadcrumbs, filter drawers, and workspace quick-switcher.").priority(TaskPriority.MEDIUM).labels(List.of(backendLbl)).assignees(List.of(sarah)).dueDate(Instant.now().plus(2, ChronoUnit.DAYS)).estimatedHours(12.0).checklist(new ArrayList<>()).comments(new ArrayList<>()).build(),
                    Task.builder().id("task-107").boardId("board-apex-sprint").columnId("col-review").title("Automated Backup & Disaster Recovery Pipeline").description("Scheduled JSON data exports with AES-256 GCM encryption.").priority(TaskPriority.HIGH).labels(List.of(devopsLbl, securityLbl)).assignees(List.of(alex)).dueDate(Instant.now().plus(1, ChronoUnit.DAYS)).estimatedHours(6.0).checklist(new ArrayList<>()).comments(new ArrayList<>()).build(),
                    Task.builder().id("task-108").boardId("board-apex-sprint").columnId("col-done").title("Production Container Healthcheck Endpoints").description("Actuator health, metrics, and readiness probes configured.").priority(TaskPriority.LOW).labels(List.of(devopsLbl)).assignees(List.of(marcus)).dueDate(Instant.now().minus(2, ChronoUnit.DAYS)).estimatedHours(4.0).checklist(new ArrayList<>()).comments(new ArrayList<>()).build(),

                    // Infra tasks
                    Task.builder().id("task-201").boardId("board-apex-infra").columnId("col-infra-todo").title("Deploy Istio Service Mesh v1.21").description("Configure mutual TLS across all microservice pods.").priority(TaskPriority.HIGH).labels(List.of(devopsLbl, securityLbl)).assignees(List.of(alex)).dueDate(Instant.now().plus(5, ChronoUnit.DAYS)).checklist(new ArrayList<>()).comments(new ArrayList<>()).build(),
                    Task.builder().id("task-202").boardId("board-apex-infra").columnId("col-infra-active").title("Provision Cloud SQL Read-Replicas").description("High throughput read-scaling for identity and user metadata.").priority(TaskPriority.HIGH).labels(List.of(databaseLbl, devopsLbl)).assignees(List.of(marcus)).dueDate(Instant.now().plus(2, ChronoUnit.DAYS)).checklist(new ArrayList<>()).comments(new ArrayList<>()).build(),
                    Task.builder().id("task-203").boardId("board-apex-infra").columnId("col-infra-audit").title("SOC 2 Type II Security Penetration Audit").description("Third-party auditor penetration review of cloud endpoints.").priority(TaskPriority.URGENT).labels(List.of(securityLbl)).assignees(List.of(elena, alex)).dueDate(Instant.now().plus(3, ChronoUnit.DAYS)).checklist(new ArrayList<>()).comments(new ArrayList<>()).build(),

                    // Talent tasks
                    Task.builder().id("task-301").boardId("board-apex-talent").columnId("col-talent-screen").title("Staff Distributed Systems Engineer Pipeline").description("Screening senior engineers with Kafka and Raft consensus experience.").priority(TaskPriority.HIGH).labels(List.of(backendLbl)).assignees(List.of(david)).dueDate(Instant.now().plus(10, ChronoUnit.DAYS)).checklist(new ArrayList<>()).comments(new ArrayList<>()).build(),
                    Task.builder().id("task-302").boardId("board-apex-talent").columnId("col-talent-tech").title("Principal Product Designer Interview Round").description("Portfolio review and design system whiteboard exercise.").priority(TaskPriority.MEDIUM).labels(List.of(backendLbl)).assignees(List.of(sarah)).dueDate(Instant.now().plus(4, ChronoUnit.DAYS)).checklist(new ArrayList<>()).comments(new ArrayList<>()).build(),
                    Task.builder().id("task-303").boardId("board-apex-talent").columnId("col-talent-offer").title("Senior Security Engineer Offer Letter").description("Compensation package and IP agreement sign-off.").priority(TaskPriority.URGENT).labels(List.of(securityLbl)).assignees(List.of(david)).dueDate(Instant.now().plus(2, ChronoUnit.DAYS)).checklist(new ArrayList<>()).comments(new ArrayList<>()).build(),

                    // Nova tasks
                    Task.builder().id("task-401").boardId("board-nova-core").columnId("col-nova-backlog").title("ISO 8583 Settlement Adapter Integration").description("Financial messaging interchange for bank clearing networks.").priority(TaskPriority.URGENT).labels(List.of(backendLbl, securityLbl)).assignees(List.of(david)).dueDate(Instant.now().plus(7, ChronoUnit.DAYS)).checklist(new ArrayList<>()).comments(new ArrayList<>()).build(),
                    Task.builder().id("task-402").boardId("board-nova-core").columnId("col-nova-dev").title("HSM Key Rotation & PCI-DSS 4.0 Compliance").description("Hardware Security Module automated key rollover routine.").priority(TaskPriority.HIGH).labels(List.of(securityLbl)).assignees(List.of(alex)).dueDate(Instant.now().plus(3, ChronoUnit.DAYS)).checklist(new ArrayList<>()).comments(new ArrayList<>()).build(),
                    Task.builder().id("task-403").boardId("board-nova-core").columnId("col-nova-qa").title("Load Test 25,000 Transactions Per Second").description("JMeter stress testing against payment engine clusters.").priority(TaskPriority.HIGH).labels(List.of(devopsLbl)).assignees(List.of(marcus)).dueDate(Instant.now().plus(1, ChronoUnit.DAYS)).checklist(new ArrayList<>()).comments(new ArrayList<>()).build(),

                    // Nova AML tasks
                    Task.builder().id("task-501").boardId("board-nova-aml").columnId("col-aml-prep").title("FinCEN SAR Automated Filing Pipeline").description("Suspicious activity report batch generation and encryption.").priority(TaskPriority.HIGH).labels(List.of(securityLbl)).assignees(List.of(elena)).dueDate(Instant.now().plus(5, ChronoUnit.DAYS)).checklist(new ArrayList<>()).comments(new ArrayList<>()).build(),
                    Task.builder().id("task-502").boardId("board-nova-aml").columnId("col-aml-evidence").title("Sanctions & PEP Screening Audit Evidence").description("Compile 12-month query logs for independent regulatory auditor.").priority(TaskPriority.URGENT).labels(List.of(securityLbl)).assignees(List.of(elena, david)).dueDate(Instant.now().plus(2, ChronoUnit.DAYS)).checklist(new ArrayList<>()).comments(new ArrayList<>()).build(),
                    Task.builder().id("task-503").boardId("board-nova-aml").columnId("col-aml-review").title("External Regulatory On-Site Walkthrough").description("Formal interview with financial audit committee.").priority(TaskPriority.URGENT).labels(List.of(securityLbl)).assignees(List.of(elena)).dueDate(Instant.now().plus(1, ChronoUnit.DAYS)).checklist(new ArrayList<>()).comments(new ArrayList<>()).build(),

                    // Pulse Brand tasks
                    Task.builder().id("task-601").boardId("board-pulse-brand").columnId("col-pulse-concept").title("3D Isometric Product Illustrations").description("Cinema4D & Blender asset kit for enterprise website.").priority(TaskPriority.MEDIUM).labels(List.of(backendLbl)).assignees(List.of(sarah)).dueDate(Instant.now().plus(6, ChronoUnit.DAYS)).checklist(new ArrayList<>()).comments(new ArrayList<>()).build(),
                    Task.builder().id("task-602").boardId("board-pulse-brand").columnId("col-pulse-design").title("Design System Tokens & Figma Variables").description("Dark mode, semantic spacing, and WCAG AAA color scale.").priority(TaskPriority.HIGH).labels(List.of(backendLbl)).assignees(List.of(sarah)).dueDate(Instant.now().plus(3, ChronoUnit.DAYS)).checklist(new ArrayList<>()).comments(new ArrayList<>()).build(),
                    Task.builder().id("task-603").boardId("board-pulse-brand").columnId("col-pulse-stakeholder").title("Executive Brand Deck Presentation").description("Final brand book approval with executive stakeholders.").priority(TaskPriority.URGENT).labels(List.of(backendLbl)).assignees(List.of(sarah, alex)).dueDate(Instant.now().plus(2, ChronoUnit.DAYS)).checklist(new ArrayList<>()).comments(new ArrayList<>()).build()
            );

            taskRepository.saveAll(tasks);
            log.info("Comprehensive Tasks successfully seeded in MongoDB.");
        }
    }
}
