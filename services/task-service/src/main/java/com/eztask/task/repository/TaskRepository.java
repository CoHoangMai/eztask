package com.eztask.task.repository;

import com.eztask.task.model.Task;
import com.eztask.task.model.TaskPriority;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends MongoRepository<Task, String> {
    List<Task> findByBoardId(String boardId);
    List<Task> findByColumnId(String columnId);
    List<Task> findByBoardIdAndColumnId(String boardId, String columnId);
    List<Task> findByBoardIdAndPriority(String boardId, TaskPriority priority);
    void deleteByBoardId(String boardId);
}
