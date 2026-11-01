package com.taskflow.backend.task;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @InjectMocks
    private TaskService taskService;

    @Test
    void create_usesDefaults_whenStatusAndPriorityAreMissing() {
        when(taskRepository.save(any(Task.class))).thenAnswer(inv -> inv.getArgument(0));

        TaskResponse response = taskService.create(
                new TaskRequest("Learn tests", null, null, null, null));

        assertThat(response.title()).isEqualTo("Learn tests");
        assertThat(response.status()).isEqualTo(TaskStatus.TODO);
        assertThat(response.priority()).isEqualTo(TaskPriority.MEDIUM);
    }

    @Test
    void getById_throwsNotFound_whenTaskDoesNotExist() {
        when(taskRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> taskService.getById(99L))
                .isInstanceOf(TaskNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    void update_changesTheFields_whenTaskExists() {
        Task existing = new Task();
        existing.setTitle("Old title");
        when(taskRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(taskRepository.save(any(Task.class))).thenAnswer(inv -> inv.getArgument(0));

        TaskResponse response = taskService.update(1L,
                new TaskRequest("New title", "details", TaskStatus.DONE, TaskPriority.HIGH, null));

        assertThat(response.title()).isEqualTo("New title");
        assertThat(response.description()).isEqualTo("details");
        assertThat(response.status()).isEqualTo(TaskStatus.DONE);
        assertThat(response.priority()).isEqualTo(TaskPriority.HIGH);
    }

    @Test
    void delete_throwsNotFound_andDeletesNothing_whenTaskDoesNotExist() {
        when(taskRepository.findById(5L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> taskService.delete(5L))
                .isInstanceOf(TaskNotFoundException.class);

        verify(taskRepository, never()).delete(any(Task.class));
    }
}