import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../service/auth.service';

interface User{
  userID:string;
  firstName:string;
  lastName:string;
  email:string;
  password:string;
}

@Component({
  selector: 'app-login',
  imports: [FormsModule,RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  user:User={
    userID:"",
    firstName:"",
    lastName:"",
    email:"",
    password:"",
  }
  @ViewChild('jsLogin', { static: false }) formRef!: ElementRef<HTMLFormElement>;

  http=inject(HttpClient);
  constructor(private router:Router,private authService: AuthService){}
  ngAfterViewInit(): void {
    const loginBtn = document.getElementById('js-login-btn');
    const form = document.getElementById('js-login') as HTMLFormElement;

    if (loginBtn && form) {
      loginBtn.addEventListener('click', (event) => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
          form.classList.add('was-validated');
          return;
        }
        console.log(this.user);
        this.http.post<{ message: string }>("https://localhost:7218/api/Auth/login",this.user).subscribe((res:any)=>{
          if(res.message=='success'){
            console.log(res);
            this.user.password="";
            this.user.firstName=res.firstName;
            this.user.lastName=res.lastName;
            this.user.userID=res.userID;
            this.authService.login(this.user,res.token);
            this.user.firstName="";
            this.user.lastName="";
            this.user.email="";
            this.router.navigate(['/home']);

          }
          else{
            console.log("there")
            console.log(res.message);
          }
        // You can add your submit logic here
      });
      });
    }
  }
}

