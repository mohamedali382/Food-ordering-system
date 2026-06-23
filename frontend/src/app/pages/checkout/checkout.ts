import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class Checkout implements OnInit {
  paymentMethod = signal<'ONLINE' | 'COD'>('ONLINE');
  isPlacingOrder = signal(false);
  errorMessage = signal('');

  firstName  = signal('');
  lastName   = signal('');
  phone      = signal('');
  email      = signal('');
  address    = signal('');
  city       = signal('');
  zipCode    = signal('');
  notes      = signal('');
  cardNumber = signal('');
  cardExpiry = signal('');
  cardCvv    = signal('');

  errors = signal<Record<string, string>>({});

  readonly egyptianCities = [
    'Cairo', 'Giza', 'Alexandria', 'Luxor', 'Aswan',
    'Port Said', 'Suez', 'Ismailia', 'Mansoura', 'Tanta',
    'Zagazig', 'Damietta', 'Minya', 'Asyut', 'Sohag',
    'Qena', 'Hurghada', 'Sharm El-Sheikh', 'Fayoum', 'Beni Suef',
    'Kafr El-Sheikh', 'Damanhur', 'Shibin El-Kom', 'Banha',
    'Arish', 'Marsa Matruh', 'New Valley', 'South Sinai', 'North Sinai',
  ];

  constructor(
    private authService: AuthService,
    public cartService: CartService,
    private orderService: OrderService,
    private router: Router,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user?.email) this.email.set(user.email);
  }

  private t(key: string): string {
    return this.translate.instant(key);
  }

  setPayment(method: 'ONLINE' | 'COD'): void {
    this.paymentMethod.set(method);
    const e = { ...this.errors() };
    delete e['cardNumber'];
    delete e['cardExpiry'];
    delete e['cardCvv'];
    this.errors.set(e);
  }

  private validateAll(): boolean {
    const e: Record<string, string> = {};

    if (!this.firstName().trim()) {
      e['firstName'] = this.t('CHECKOUT.VALIDATION.FIRST_NAME_REQUIRED');
    } else if (!/^[\u0600-\u06FFa-zA-Z\s]+$/.test(this.firstName().trim())) {
      e['firstName'] = this.t('CHECKOUT.VALIDATION.FIRST_NAME_INVALID');
    }

    if (!this.lastName().trim()) {
      e['lastName'] = this.t('CHECKOUT.VALIDATION.LAST_NAME_REQUIRED');
    } else if (!/^[\u0600-\u06FFa-zA-Z\s]+$/.test(this.lastName().trim())) {
      e['lastName'] = this.t('CHECKOUT.VALIDATION.LAST_NAME_INVALID');
    }

    if (!this.phone().trim()) {
      e['phone'] = this.t('CHECKOUT.VALIDATION.PHONE_REQUIRED');
    } else if (!/^01[0125][0-9]{8}$/.test(this.phone().trim())) {
      e['phone'] = this.t('CHECKOUT.VALIDATION.PHONE_INVALID');
    }

    if (!this.address().trim()) {
      e['address'] = this.t('CHECKOUT.VALIDATION.ADDRESS_REQUIRED');
    } else if (this.address().trim().length < 10) {
      e['address'] = this.t('CHECKOUT.VALIDATION.ADDRESS_SHORT');
    }

    if (!this.city()) {
      e['city'] = this.t('CHECKOUT.VALIDATION.CITY_REQUIRED');
    }

    if (!this.zipCode().trim()) {
      e['zipCode'] = this.t('CHECKOUT.VALIDATION.ZIP_REQUIRED');
    } else if (!/^[1-5][0-9]{4}$/.test(this.zipCode().trim())) {
      e['zipCode'] = this.t('CHECKOUT.VALIDATION.ZIP_INVALID');
    }

    if (this.paymentMethod() === 'ONLINE') {
      const rawCard = this.cardNumber().replace(/\s/g, '');
      if (!rawCard) {
        e['cardNumber'] = this.t('CHECKOUT.VALIDATION.CARD_REQUIRED');
      } else if (!/^\d{16}$/.test(rawCard)) {
        e['cardNumber'] = this.t('CHECKOUT.VALIDATION.CARD_INVALID');
      }

      if (!this.cardExpiry().trim()) {
        e['cardExpiry'] = this.t('CHECKOUT.VALIDATION.EXPIRY_REQUIRED');
      } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(this.cardExpiry().trim())) {
        e['cardExpiry'] = this.t('CHECKOUT.VALIDATION.EXPIRY_FORMAT');
      } else {
        const [mm, yy] = this.cardExpiry().split('/');
        const expiry = new Date(2000 + parseInt(yy), parseInt(mm) - 1);
        if (expiry < new Date()) {
          e['cardExpiry'] = this.t('CHECKOUT.VALIDATION.EXPIRY_EXPIRED');
        }
      }

      if (!this.cardCvv().trim()) {
        e['cardCvv'] = this.t('CHECKOUT.VALIDATION.CVV_REQUIRED');
      } else if (!/^\d{3,4}$/.test(this.cardCvv().trim())) {
        e['cardCvv'] = this.t('CHECKOUT.VALIDATION.CVV_INVALID');
      }
    }

    this.errors.set(e);
    return Object.keys(e).length === 0;
  }

  clearError(field: string): void {
    const e = { ...this.errors() };
    delete e[field];
    this.errors.set(e);
  }

  hasError(field: string): boolean {
    return !!this.errors()[field];
  }

  getError(field: string): string {
    return this.errors()[field] || '';
  }

  placeOrder(): void {
    if (this.cartService.items().length === 0) {
      this.errorMessage.set(this.t('CHECKOUT.VALIDATION.CART_EMPTY'));
      return;
    }

    if (!this.validateAll()) {
      this.errorMessage.set(this.t('CHECKOUT.VALIDATION.FIX_ERRORS'));
      return;
    }

    this.isPlacingOrder.set(true);
    this.errorMessage.set('');

    const orderPayload = {
      items: this.cartService.items().map(i => ({
        productId: i.id,
        quantity:  i.quantity,
        price:     i.price,
      })),
      totalAmount:     this.cartService.total(),
      paymentMethod:   this.paymentMethod(),
      deliveryAddress: `${this.address()}, ${this.city()}, ${this.zipCode()}`,
      notes:           this.notes(),
      customerEmail:   this.email(),
    };

    this.orderService.createOrder(orderPayload).subscribe({
      next: () => {
        this.cartService.clear();
        this.router.navigate(['/track'], { state: { orderPlaced: true } });
      },
      error: (err) => {
        console.error('Order failed:', err);
        this.errorMessage.set(this.t('CHECKOUT.VALIDATION.ORDER_FAILED'));
        this.isPlacingOrder.set(false);
      }
    });
  }
}
