import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
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
    MatBadgeModule,
    NotificationItemComponent,
  ],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent {
  @Input() alertas: AlertaDashboard[] = [];
  @Input() alertasCount: number = 0;
  @Output() resolver = new EventEmitter<number>();

  onResolverAlerta(alertaId: number): void {
    this.resolver.emit(alertaId);
  }
}
