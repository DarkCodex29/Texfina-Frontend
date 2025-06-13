import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-wrapper">
      <!-- Skeleton para tabla -->
      <div *ngIf="type === 'table'" class="skeleton-table">
        <div class="skeleton-row skeleton-header">
          <div
            *ngFor="let col of columns"
            class="skeleton-cell skeleton-header-cell"
            [style.width]="col.width"
          >
            <div class="skeleton-line skeleton-header-line"></div>
          </div>
        </div>

        <div
          *ngFor="let row of getRows()"
          class="skeleton-row skeleton-data-row"
        >
          <div
            *ngFor="let col of columns; let i = index"
            class="skeleton-cell"
            [style.width]="col.width"
          >
            <div
              class="skeleton-line"
              [class.skeleton-badge]="col.type === 'badge'"
              [class.skeleton-text]="col.type === 'text'"
              [class.skeleton-price]="col.type === 'price'"
              [class.skeleton-actions]="col.type === 'actions'"
              [style.width]="getLineWidth(col, i)"
            ></div>
            <div
              *ngIf="col.type === 'text' && col.hasSubtext"
              class="skeleton-line skeleton-subtext"
              [style.width]="getSubtextWidth(i)"
            ></div>
          </div>
        </div>
      </div>

      <!-- Skeleton para cards -->
      <div *ngIf="type === 'card'" class="skeleton-card">
        <div class="skeleton-card-header">
          <div class="skeleton-line skeleton-title"></div>
          <div class="skeleton-line skeleton-subtitle"></div>
        </div>
        <div class="skeleton-card-content">
          <div
            *ngFor="let line of getCardLines()"
            class="skeleton-line skeleton-content-line"
          ></div>
        </div>
      </div>

      <!-- Skeleton para filtros -->
      <div *ngIf="type === 'filters'" class="skeleton-filters">
        <div class="skeleton-filters-header">
          <div class="skeleton-line skeleton-filter-title"></div>
        </div>
        <div class="skeleton-filters-grid">
          <div
            *ngFor="let filter of getFilterInputs()"
            class="skeleton-filter-input"
          >
            <div class="skeleton-line skeleton-input"></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./skeleton.component.scss'],
})
export class SkeletonComponent {
  @Input() type: 'table' | 'card' | 'filters' = 'table';
  @Input() rows: number = 5;
  @Input() columns: SkeletonColumn[] = [];
  @Input() cardLines: number = 3;
  @Input() filterInputs: number = 6;

  getRows(): number[] {
    return Array(this.rows)
      .fill(0)
      .map((_, i) => i);
  }

  getCardLines(): number[] {
    return Array(this.cardLines)
      .fill(0)
      .map((_, i) => i);
  }

  getFilterInputs(): number[] {
    return Array(this.filterInputs)
      .fill(0)
      .map((_, i) => i);
  }

  getLineWidth(col: SkeletonColumn, index: number): string {
    if (col.type === 'badge') return '80%';
    if (col.type === 'price') return '70%';
    if (col.type === 'actions') return '60px';

    // Variación aleatoria para texto
    const variations = ['85%', '92%', '78%', '88%', '95%'];
    return variations[index % variations.length];
  }

  getSubtextWidth(index: number): string {
    const variations = ['60%', '55%', '65%', '58%', '62%'];
    return variations[index % variations.length];
  }
}

export interface SkeletonColumn {
  width: string;
  type: 'text' | 'badge' | 'price' | 'actions';
  hasSubtext?: boolean;
}
