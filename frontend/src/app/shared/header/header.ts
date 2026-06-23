import { Component, Inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { DOCUMENT, NgClass, NgIf } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslatePipe, NgClass, NgIf],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class HeaderComponent {
  mobileMenuOpen = signal(false);
  cartCount = signal(0);

  constructor(
    private translate: TranslateService,
    @Inject(DOCUMENT) private document: Document,
    public authService: AuthService,
    public cartService: CartService, 
  ) {}

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((v) => !v);
  }

  useLanguage(language: string): void {
    this.translate.use(language);
    const html = this.document.getElementsByTagName('html')[0] as HTMLHtmlElement;
    html.dir = language === 'ar' ? 'rtl' : 'ltr';
    html.lang = language;
  }

  onLangChange(event: Event): void {
    this.useLanguage((event.target as HTMLSelectElement).value);
  }

  logout(): void {
    this.authService.logout();
  }
}
