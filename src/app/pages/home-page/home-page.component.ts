import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
})
export class HomePageComponent {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  get username(): string {
    return this.authService.getUsername();
  }

  logout(): void {
    this.authService.logout();
    void this.router.navigate(['/login']);
  }
}
