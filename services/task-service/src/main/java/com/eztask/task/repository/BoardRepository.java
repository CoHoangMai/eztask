package com.eztask.task.repository;

import com.eztask.task.model.Board;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BoardRepository extends MongoRepository<Board, String> {
    List<Board> findByOwnerId(String ownerId);
}
