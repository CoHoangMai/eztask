package com.eztask.task.repository;

import com.eztask.task.model.Board;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface BoardRepository extends MongoRepository<Board, String> {
    List<Board> findByOwnerId(String ownerId);
    List<Board> findByWorkspaceId(String workspaceId);
    List<Board> findByWorkspaceIdAndIdIn(String workspaceId, Collection<String> ids);
    List<Board> findByTeamId(String teamId);
}
