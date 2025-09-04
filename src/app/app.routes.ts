import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/chatbot/chatbot').then(m => m.ChatbotComponent)
  },
  {
    path: '**',
    loadComponent: () => import('./shared/ui/page-not-found/page-not-found').then(m => m.PageNotFoundComponent)
  }
];
