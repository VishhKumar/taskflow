import { Component, OnInit, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TaskApi } from './task-api';
import { TaskPriority, TaskStatus } from './task.model';

@Component({
  selector: 'app-task-edit',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './task-edit.html',
})
export class TaskEdit implements OnInit {
  private readonly api = inject(TaskApi);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  // Filled automatically from the :id part of the URL
  readonly id = input.required<string>();

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    description: [''],
    status: ['TODO' as TaskStatus],
    priority: ['MEDIUM' as TaskPriority],
    dueDate: [''],
  });

  ngOnInit(): void {
    this.api.get(Number(this.id())).subscribe({
      next: (task) => {
        this.form.patchValue({
          title: task.title,
          description: task.description ?? '',
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate ?? '',
        });
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load this task. It may not exist.');
        this.loading.set(false);
      },
    });
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { title, description, status, priority, dueDate } = this.form.getRawValue();
    this.api
      .update(Number(this.id()), {
        title,
        description: description || null,
        status,
        priority,
        dueDate: dueDate || null,
      })
      .subscribe({
        next: () => this.router.navigate(['/tasks']),
        error: () => this.error.set('Could not save your changes.'),
      });
  }
}