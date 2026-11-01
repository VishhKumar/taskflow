package com.taskflow.backend.task;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> getAll() {
        return taskRepository.findAll().stream()
                .map(TaskResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public TaskResponse getById(Long id) {
        return TaskResponse.from(findOrThrow(id));
    }

    @Transactional
    public TaskResponse create(TaskRequest request) {
        Task task = new Task();
        apply(task, request);
        return TaskResponse.from(taskRepository.save(task));
    }

    @Transactional
    public TaskResponse update(Long id, TaskRequest request) {
        Task task = findOrThrow(id);
        apply(task, request);
        return TaskResponse.from(taskRepository.save(task));
    }

    @Transactional
    public void delete(Long id) {
        taskRepository.delete(findOrThrow(id));
    }

    private Task findOrThrow(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new TaskNotFoundException(id));
    }

    private void apply(Task task, TaskRequest request) {
        task.setTitle(request.title());
        task.setDescription(request.description());
        if (request.status() != null) {
            task.setStatus(request.status());
        }
        if (request.priority() != null) {
            task.setPriority(request.priority());
        }
        task.setDueDate(request.dueDate());
    }
}