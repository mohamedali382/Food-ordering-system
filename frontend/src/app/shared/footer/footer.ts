import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { NgIf } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, TranslatePipe, NgIf],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class FooterComponent {
  constructor(public authService: AuthService) {}
}
