import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-consumos',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">
          <mat-icon>output</mat-icon>
          Consumos de Materiales
        </h1>
        <p>Registro y seguimiento de consumos de insumos en producción</p>
      </div>

      <mat-card class="coming-soon">
        <mat-card-content>
          <div class="content">
            <mat-icon>construction</mat-icon>
            <h2>Módulo en Desarrollo</h2>
            <p>
              El módulo de Consumos está siendo desarrollado y estará disponible
              próximamente.
            </p>
            <p>Incluirá:</p>
            <ul>
              <li>Registro de consumos por orden de producción</li>
              <li>Trazabilidad de materiales consumidos</li>
              <li>Reportes de consumo por período</li>
              <li>Control de desperdicios</li>
            </ul>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .page-container {
        padding: 24px;
        max-width: 1200px;
        margin: 0 auto;
      }

      .page-header {
        margin-bottom: 24px;

        .page-title {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 0 0 8px 0;
          font-size: 28px;
          font-weight: 600;
          color: #1a1a1a;

          mat-icon {
            color: #ff9800;
          }
        }

        p {
          color: #666;
          margin: 0;
        }
      }

      .coming-soon {
        text-align: center;
        padding: 48px 24px;

        .content {
          mat-icon {
            font-size: 72px;
            height: 72px;
            width: 72px;
            color: #ff9800;
            margin-bottom: 24px;
          }

          h2 {
            color: #333;
            margin-bottom: 16px;
          }

          p {
            color: #666;
            margin-bottom: 16px;
          }

          ul {
            text-align: left;
            display: inline-block;
            color: #666;
          }
        }
      }
    `,
  ],
})
export class ConsumosComponent {}
