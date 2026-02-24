import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-page',
  imports: [FormsModule],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
})
export class LoginPageComponent {
  username = 'admin';
  password = 'admin123';
  errorMessage = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  onSubmit(): void {
    const isLoggedIn = this.authService.login(this.username.trim(), this.password);

    if (isLoggedIn) {
      this.errorMessage = '';
      void this.router.navigate(['/home']);
      return;
    }

    this.errorMessage = 'Invalid credentials. Use admin / admin123';
  }
}
