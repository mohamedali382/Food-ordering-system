import { Component, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { OrderService, Order as ApiOrder } from '../../services/order.service';
import { ProductService, Product } from '../../services/product.service';
import { UserService, User } from '../../services/user.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin implements OnInit {
  activeTab = signal<'orders' | 'products' | 'users'>('orders');

  // ── Orders ──────────────────────────────────────────────
  orders = signal<ApiOrder[]>([]);
  ordersLoading = signal(false);
  selectedOrder = signal<ApiOrder | null>(null);

  // ── Products ─────────────────────────────────────────────
  products = signal<Product[]>([]);
  productsLoading = signal(false);
  showProductModal = signal(false);
  editingProduct = signal<Product | null>(null);
  productForm!: FormGroup;
  productSaving = signal(false);

  // ── Users ────────────────────────────────────────────────
  users = signal<User[]>([]);
  usersLoading = signal(false);

  // ── Shared ───────────────────────────────────────────────
  errorMessage = signal('');
  stats = signal<any>({ totalOrders: 0, totalRevenue: 0, ordersByStatus: {} });

  statusOptions = ['PENDING', 'CONFIRMED', 'PREPARING', 'DELIVERING', 'COMPLETED', 'CANCELLED'];

  categories = ['Burgers', 'Pizza', 'Pasta', 'Salads', 'Drinks', 'Desserts', 'Sides'];

  constructor(
    private orderService: OrderService,
    private productService: ProductService,
    private userService: UserService,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.buildProductForm();
    this.loadOrders();
    this.loadStats();
  }

  // ── Tab switching ─────────────────────────────────────────
  switchTab(tab: 'orders' | 'products' | 'users'): void {
    this.activeTab.set(tab);
    if (tab === 'products' && this.products().length === 0) this.loadProducts();
    if (tab === 'users' && this.users().length === 0) this.loadUsers();
  }

  // ── Orders ───────────────────────────────────────────────
  loadOrders(): void {
    this.ordersLoading.set(true);
    this.orderService.getAllOrders().subscribe({
      next: (orders) => {
        this.orders.set(orders.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));
        this.ordersLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load orders');
        this.ordersLoading.set(false);
      },
    });
  }

  loadStats(): void {
    this.orderService.getOrderStats().subscribe({
      next: (stats) => this.stats.set(stats),
      error: () => {},
    });
  }

  updateOrderStatus(orderId: number, newStatus: string): void {
    // Optimistic update
    this.orders.update(orders =>
      orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
    );
    this.orderService.updateOrderStatus(orderId, newStatus).subscribe({
      next: () => this.loadStats(),
      error: () => {
        this.errorMessage.set('Failed to update order status');
        this.loadOrders(); // revert
      },
    });
  }

  viewOrder(order: ApiOrder): void {
    // Enrich items with product details
    this.selectedOrder.set(order);
    // Load product details for each item
    const enriched = { ...order, enrichedItems: [] as any[] };
    let pending = order.items.length;
    if (pending === 0) { this.selectedOrder.set(enriched as any); return; }

    order.items.forEach(item => {
      this.productService.getProductById(item.productId).subscribe({
        next: (product) => {
          enriched.enrichedItems.push({ ...item, product });
          pending--;
          if (pending === 0) this.selectedOrder.set(enriched as any);
        },
        error: () => {
          enriched.enrichedItems.push({ ...item, product: null });
          pending--;
          if (pending === 0) this.selectedOrder.set(enriched as any);
        }
      });
    });
  }

  closeOrderModal(): void { this.selectedOrder.set(null); }

  // ── Products ─────────────────────────────────────────────
  loadProducts(): void {
    this.productsLoading.set(true);
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.products.set(products);
        this.productsLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load products');
        this.productsLoading.set(false);
      },
    });
  }

  buildProductForm(product?: Product): void {
    this.productForm = this.fb.group({
      nameEn:        [product?.nameEn        ?? '', Validators.required],
      nameAr:        [product?.nameAr        ?? '', Validators.required],
      descriptionEn: [product?.descriptionEn ?? '', Validators.required],
      descriptionAr: [product?.descriptionAr ?? ''],
      price:         [product?.price         ?? '', [Validators.required, Validators.min(0)]],
      imageUrl:      [product?.imageUrl      ?? '', Validators.required],
      category:      [product?.category      ?? 'Burgers', Validators.required],
      isAvailable:   [product?.isAvailable   ?? true],
    });
  }

  openAddProduct(): void {
    this.editingProduct.set(null);
    this.buildProductForm();
    this.showProductModal.set(true);
  }

  openEditProduct(product: Product): void {
    this.editingProduct.set(product);
    this.buildProductForm(product);
    this.showProductModal.set(true);
  }

  closeProductModal(): void {
    this.showProductModal.set(false);
    this.editingProduct.set(null);
  }

  saveProduct(): void {
    if (this.productForm.invalid) { this.productForm.markAllAsTouched(); return; }
    this.productSaving.set(true);
    const payload = this.productForm.value;
    const editing = this.editingProduct();

    const call$ = editing
      ? this.productService.updateProduct(editing.id, payload)
      : this.productService.createProduct(payload);

    call$.subscribe({
      next: () => {
        this.productSaving.set(false);
        this.closeProductModal();
        this.loadProducts();
      },
      error: () => {
        this.errorMessage.set('Failed to save product');
        this.productSaving.set(false);
      },
    });
  }

  deleteProduct(id: number): void {
    if (!confirm('Delete this product?')) return;
    this.productService.deleteProduct(id).subscribe({
      next: () => this.products.update(ps => ps.filter(p => p.id !== id)),
      error: () => this.errorMessage.set('Failed to delete product'),
    });
  }

  toggleAvailability(product: Product): void {
    const updated = { ...product, isAvailable: !product.isAvailable };
    this.productService.updateProduct(product.id, { isAvailable: updated.isAvailable }).subscribe({
      next: () => this.products.update(ps => ps.map(p => p.id === product.id ? updated : p)),
      error: () => this.errorMessage.set('Failed to update availability'),
    });
  }

  // ── Users ────────────────────────────────────────────────
  loadUsers(): void {
    this.usersLoading.set(true);
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.usersLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load users');
        this.usersLoading.set(false);
      },
    });
  }

  // ── Helpers ──────────────────────────────────────────────
  getStatusBadgeClass(status: string): string {
    const map: Record<string, string> = {
      PENDING:    'badge-yellow',
      CONFIRMED:  'badge-purple',
      PREPARING:  'badge-orange',
      DELIVERING: 'badge-blue',
      COMPLETED:  'badge-green',
      CANCELLED:  'badge-red',
    };
    return map[status] || 'badge-gray';
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  clearError(): void { this.errorMessage.set(''); }
}
