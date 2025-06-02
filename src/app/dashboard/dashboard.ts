import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    RouterModule,
  ],
  template: `
    <div class="dashboard-container">
      <h1>Dashboard - Sistema Texfina</h1>
      
      <div class="cards-grid">
        <mat-card class="dashboard-card" routerLink="/dashboard/materiales">
          <mat-card-header>
            <mat-icon mat-card-avatar>inventory</mat-icon>
            <mat-card-title>Materiales</mat-card-title>
            <mat-card-subtitle>Gestión de insumos</mat-card-subtitle>
          </mat-card-header>
        </mat-card>

        <mat-card class="dashboard-card" routerLink="/dashboard/proveedores">
          <mat-card-header>
            <mat-icon mat-card-avatar>business</mat-icon>
            <mat-card-title>Proveedores</mat-card-title>
            <mat-card-subtitle>Gestión de proveedores</mat-card-subtitle>
          </mat-card-header>
        </mat-card>

        <mat-card class="dashboard-card" routerLink="/dashboard/usuarios">
          <mat-card-header>
            <mat-icon mat-card-avatar>people</mat-icon>
            <mat-card-title>Usuarios</mat-card-title>
            <mat-card-subtitle>Gestión de usuarios</mat-card-subtitle>
          </mat-card-header>
        </mat-card>

        <mat-card class="dashboard-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>assessment</mat-icon>
            <mat-card-title>Reportes</mat-card-title>
            <mat-card-subtitle>Análisis y reportes</mat-card-subtitle>
          </mat-card-header>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 2rem;
      background-color: #f8f9fa;
      min-height: 100vh;
    }

    h1 {
      color: #333;
      margin-bottom: 2rem;
      font-size: 2rem;
      font-weight: 500;
    }

    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .dashboard-card {
      cursor: pointer;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      border-radius: 12px;
      padding: 1rem;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      }

      mat-card-header {
        padding-bottom: 1rem;
      }

      mat-icon[mat-card-avatar] {
        background-color: #7c3aed;
        color: white;
        font-size: 2rem;
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
      }

      mat-card-title {
        color: #333;
        font-size: 1.25rem;
        font-weight: 600;
      }

      mat-card-subtitle {
        color: #666;
        font-size: 0.875rem;
      }
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 1rem;
      }

      .cards-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      h1 {
        font-size: 1.5rem;
        margin-bottom: 1.5rem;
      }
    }
  `]
})
export class DashboardComponent {
}

// Export adicional para compatibilidad con rutas
export { DashboardComponent as Dashboard }; 