import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AlertaDashboard } from '../../../services/dashboard.service';

@Component({
  selector: 'app-notification-item',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './notification-item.component.html',
  styleUrls: ['./notification-item.component.scss'],
})
export class NotificationItemComponent {
  @Input() alerta!: AlertaDashboard;
  @Output() resolver = new EventEmitter<number>();

  onResolver(): void {
    this.resolver.emit(this.alerta.id);
  }

  formatearTiempoRelativo(fecha: Date | string): string {
    const ahora = new Date();
    const fechaAlerta = new Date(fecha);
    const diferencia = ahora.getTime() - fechaAlerta.getTime();

    const minutos = Math.floor(diferencia / (1000 * 60));
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));

    if (minutos < 1) return 'Ahora';
    if (minutos < 60) return `hace ${minutos}m`;
    if (horas < 24) return `hace ${horas}h`;
    return `hace ${dias}d`;
  }
}
