import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TaskApi } from './task-api';
import { TaskItem, TaskPriority } from './task.model';

@Component({
  selector: 'app-task-list',
  imports: [ReactiveFormsModule],
  templateUrl: './task-list.html',
})
export class TaskList implements OnInit {
  private readonly api = inject(TaskApi);
  private readonly fb = inject(FormBuilder);

  protected readonly tasks = signal<TaskItem[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly actionError = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    priority: ['MEDIUM' as TaskPriority],
    dueDate: [''],
  });

  ngOnInit(): void {
    this.api.getAll().subscribe({
      next: (data) => {
        this.tasks.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load tasks. Is the backend running?');
        this.loading.set(false);
      },
    });
  }

  protected add(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { title, priority, dueDate } = this.form.getRawValue();
    this.actionError.set(null);
    this.api.create({ title, priority, dueDate: dueDate || null }).subscribe({
      next: (created) => {
        this.tasks.update((list) => [...list, created]);
        this.form.reset();
      },
      error: () => this.actionError.set('Could not create the task.'),
    });
  }

  protected markDone(task: TaskItem): void {
    this.actionError.set(null);
    this.api
      .update(task.id, {
        title: task.title,
        description: task.description,
        priority: task.priority,
        dueDate: task.dueDate,
        status: 'DONE',
      })
      .subscribe({
        next: (updated) =>
          this.tasks.update((list) => list.map((t) => (t.id === updated.id ? updated : t))),
        error: () => this.actionError.set('Could not update the task.'),
      });
  }

  protected remove(task: TaskItem): void {
    this.actionError.set(null);
    this.api.delete(task.id).subscribe({
      next: () => this.tasks.update((list) => list.filter((t) => t.id !== task.id)),
      error: () => this.actionError.set('Could not delete the task.'),
    });
  }
}