import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { AlertaDashboard } from '../../../services/dashboard.service';
import { NotificationItemComponent } from '../notification-item/notification-item.component';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    NotificationItemComponent,
  ],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent {
  @Input() alertas: AlertaDashboard[] = [];
  @Input() alertasCount: number = 0;
  @Output() resolver = new EventEmitter<number>();

  get badgeText(): string {
    if (this.alertasCount <= 9) {
      return this.alertasCount.toString();
    } else if (this.alertasCount <= 99) {
      return this.alertasCount.toString();
    } else {
      return '99+';
    }
  }

  onResolverAlerta(alertaId: number): void {
    this.resolver.emit(alertaId);
  }
}
