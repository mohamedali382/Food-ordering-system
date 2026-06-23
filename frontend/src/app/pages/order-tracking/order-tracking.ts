import { Component, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { OrderService, Order } from '../../services/order.service';
import { TranslatePipe } from '@ngx-translate/core';

type Status = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'DELIVERING' | 'COMPLETED';

interface Step {
  key: Status;
  titleKey: string;
  descKey: string;
  icon: string;
}

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './order-tracking.html',
  styleUrl: './order-tracking.css',
})
export class OrderTracking implements OnInit {
  isLoading = signal(true);
  orderPlacedSuccess = signal(false);
  orders = signal<Order[]>([]);   // ← all orders, not just one

steps: Step[] = [
  {
    key: 'PENDING',
    titleKey: 'TRACKING.STEP_RECEIVED_TITLE',
    descKey: 'TRACKING.STEP_RECEIVED_DESC',
    icon: 'check',
  },
  {
    key: 'CONFIRMED',
    titleKey: 'TRACKING.STEP_CONFIRMED_TITLE',
    descKey: 'TRACKING.STEP_CONFIRMED_DESC',
    icon: 'check',
  },
  {
    key: 'PREPARING',
    titleKey: 'TRACKING.STEP_PREPARING_TITLE',
    descKey: 'TRACKING.STEP_PREPARING_DESC',
    icon: 'fire',
  },
  {
    key: 'DELIVERING',
    titleKey: 'TRACKING.STEP_DELIVERING_TITLE',
    descKey: 'TRACKING.STEP_DELIVERING_DESC',
    icon: 'truck',
  },
  {
    key: 'COMPLETED',
    titleKey: 'TRACKING.STEP_DELIVERED_TITLE',
    descKey: 'TRACKING.STEP_DELIVERED_DESC',
    icon: 'star',
  },
];

  private statusOrder: Status[] = ['PENDING', 'CONFIRMED', 'PREPARING', 'DELIVERING', 'COMPLETED'];

  constructor(private orderService: OrderService, private router: Router) {}

  ngOnInit(): void {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state ?? history.state;
    if (state?.['orderPlaced']) {
      this.orderPlacedSuccess.set(true);
      setTimeout(() => this.orderPlacedSuccess.set(false), 5000);
    }
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading.set(true);
    this.orderService.getMyOrders().subscribe({
      next: (orders) => {
        this.orders.set(orders);   // ← store all orders
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load orders:', err);
        this.isLoading.set(false);
      }
    });
  }

  currentStatusOf(order: Order): Status {
    return this.mapStatus(order.status);
  }

  private mapStatus(status: string): Status {
    const map: Record<string, Status> = {
      PENDING:    'PENDING',
      CONFIRMED:  'CONFIRMED',
      PREPARING:  'PREPARING',
      DELIVERING: 'DELIVERING',
      COMPLETED:  'COMPLETED',
      CANCELLED:  'PENDING',
    };
    return map[status] ?? 'PENDING';
  }

  stepState(step: Step, order: Order): 'done' | 'active' | 'upcoming' {
    const cur = this.statusOrder.indexOf(this.currentStatusOf(order));
    const idx = this.statusOrder.indexOf(step.key);
    if (idx < cur) return 'done';
    if (idx === cur) return 'active';
    return 'upcoming';
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
