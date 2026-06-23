import { Injectable, signal, computed } from '@angular/core';
import { Product } from './product.service';
import { TranslateService } from '@ngx-translate/core';

export interface CartItem {
  id: number;
  nameEn: string;
  nameAr: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  items = signal<CartItem[]>(this.loadFromStorage());

  subtotal = computed(() =>
    this.items().reduce((s, i) => s + i.price * i.quantity, 0)
  );
  delivery = signal(3.99);
  discount = signal(0);
  total = computed(() => this.subtotal() + this.delivery() - this.discount());
  totalCount = computed(() => this.items().reduce((s, i) => s + i.quantity, 0));
  toast = signal<string>('');
  private toastTimer: any;

  constructor(private translate: TranslateService) {
  this.items = signal<CartItem[]>(this.loadFromStorage());
}

  addToCart(product: Product): void {
    this.items.update(list => {
      const existing = list.find(i => i.id === product.id);
      if (existing) {
        return list.map(i =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...list, {
        id: product.id,
        nameEn: product.nameEn,
        nameAr: product.nameAr,
        price: product.price,
        quantity: 1,
        imageUrl: product.imageUrl,
      }];
    });
    this.saveToStorage();
    this.showToast(product.nameEn);
  }

private showToast(productName: string): void {
  clearTimeout(this.toastTimer);
  const message = this.translate.instant('PRODUCTS.ADDED_TO_CART', { name: productName });
  this.toast.set(message);
  this.toastTimer = setTimeout(() => this.toast.set(''), 3000);
}

  increment(id: number): void {
    this.items.update(list =>
      list.map(i => i.id === id ? { ...i, quantity: i.quantity + 1 } : i)
    );
    this.saveToStorage();
  }

  decrement(id: number): void {
    this.items.update(list =>
      list
        .map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i)
        .filter(i => i.quantity > 0)
    );
    this.saveToStorage();
  }

  remove(id: number): void {
    this.items.update(list => list.filter(i => i.id !== id));
    this.saveToStorage();
  }

  clear(): void {
    this.items.set([]);
    localStorage.removeItem('cart');
  }

  private saveToStorage(): void {
    localStorage.setItem('cart', JSON.stringify(this.items()));
  }

  private loadFromStorage(): CartItem[] {
    try {
      const stored = localStorage.getItem('cart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
}
