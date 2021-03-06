import {Component, OnInit} from '@angular/core';
import {AuthenticationService, TokenPayload} from '../authentication.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  isValidForm: boolean = true;
  isError: boolean = false;
  errorMessage: string;

  credentials: TokenPayload = {
    email: '',
    password: ''
  };

  constructor(private auth: AuthenticationService, private router: Router) {
  }


  login() {
    this.isValidForm = true;
    this.isError = false;
    if (this.credentials.email === '' || this.credentials.password === '') {
      this.isValidForm = false;
    } else {
      this.auth.login(this.credentials).subscribe(() => {
        if (this.auth.isAdmin()) {
          this.router.navigateByUrl('/admin-profile');
        } else {
          this.router.navigateByUrl('/profile');
        }
      }, (err) => {
        this.isError = true;
        this.errorMessage = err.error.message;
        console.error(err);
      });
    }
  }

  ngOnInit() {
    if (this.auth.isLoggedIn() && this.auth.isAdmin()) {
      this.router.navigateByUrl('/admin-profile');
    } else if (this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/profile');
    }
  }
}
