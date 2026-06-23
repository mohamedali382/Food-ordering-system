import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { ProductService, Product as ApiProduct } from '../../services/product.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, TranslatePipe, RouterLink],
  templateUrl: './menu.html',
  styleUrl: './menu.css'
})
export class Menu implements OnInit {
  activeCategory = signal('All');
  products = signal<ApiProduct[]>([]);
  isLoading = signal(true);
  errorMessage = signal('');

  categories = ['All', 'Burgers', 'Pizza', 'Salads', 'Desserts'];

  categoryTranslationKeys: Record<string, string> = {
  'All':      'MENU.CATEGORY_ALL',
  'Burgers':  'MENU.CATEGORY_BURGERS',
  'Pizza':    'MENU.CATEGORY_PIZZA',
  'Salads':   'MENU.CATEGORY_SALADS',
  'Desserts': 'MENU.CATEGORY_DESSERTS',
};

getCategoryLabel(cat: string): string {
  const key = this.categoryTranslationKeys[cat];
  return key ? this.translate.instant(key) : cat;
}

  constructor(
    private productService: ProductService,
    public cartService: CartService,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading.set(true);
    this.productService.getAvailableProducts().subscribe({
      next: (products) => {
        this.products.set(products);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.errorMessage.set('Failed to load products');
        this.isLoading.set(false);
      }
    });
  }

  getFilteredProducts(): ApiProduct[] {
    const category = this.activeCategory().trim();
    if (category === 'All') return this.products();
    return this.products().filter(
      p => p.category?.trim().toLowerCase() === category.toLowerCase()
    );
  }

getProductName(product: ApiProduct): string {
  return this.translate.currentLang() === 'ar' ? product.nameAr : product.nameEn;
}

getProductDesc(product: ApiProduct): string {
  return this.translate.currentLang() === 'ar' ? product.descriptionAr : product.descriptionEn;
}

  addToCart(product: ApiProduct): void {
    this.cartService.addToCart(product);
  }

  getCartItemCount(productId: number): number {
    return this.cartService.items().find(i => i.id === productId)?.quantity || 0;
  }
}
