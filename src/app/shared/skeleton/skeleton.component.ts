import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="skeleton"
      [ngClass]="classes"
      [style.height.px]="height"
      [style.width]="width"
    >
      <div class="skeleton-loader"></div>
    </div>
  `,
  styles: [
    `
      .skeleton {
        background: #f3f4f6;
        border-radius: 6px;
        overflow: hidden;
        position: relative;
        margin: 4px 0;
      }

      .skeleton-loader {
        width: 100%;
        height: 100%;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, 0.6),
          transparent
        );
        animation: skeleton-loading 1.5s infinite;
      }

      @keyframes skeleton-loading {
        0% {
          transform: translateX(-100%);
        }
        100% {
          transform: translateX(100%);
        }
      }

      .skeleton-text {
        height: 16px;
      }

      .skeleton-title {
        height: 24px;
      }

      .skeleton-card {
        height: 120px;
        border-radius: 12px;
      }

      .skeleton-table-row {
        height: 48px;
        margin: 1px 0;
      }

      .skeleton-button {
        height: 36px;
        border-radius: 6px;
      }
    `,
  ],
})
export class SkeletonComponent {
  @Input() height = 20;
  @Input() width = '100%';
  @Input() classes = '';
}
