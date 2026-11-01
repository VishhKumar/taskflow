import { Routes } from '@angular/router';
import { TaskList } from './task/task-list'; 
import { TaskEdit } from './task/task-edit';

export const routes: Routes = [
  { path: '', redirectTo: 'tasks', pathMatch: 'full' },
  { path: 'tasks', component: TaskList },
  { path: 'tasks/:id/edit', component: TaskEdit },
  { path: '**', redirectTo: 'tasks' },
];