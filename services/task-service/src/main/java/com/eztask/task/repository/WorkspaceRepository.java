package com.eztask.task.repository;

import com.eztask.task.model.Workspace;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkspaceRepository extends MongoRepository<Workspace, String> {
    Optional<Workspace> findBySlug(String slug);
    List<Workspace> findByOwnerId(String ownerId);
    List<Workspace> findByMembersUserId(String userId);
}
