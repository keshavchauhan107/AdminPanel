import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../service/auth.service';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';

interface User {
  firstName: string;
  lastName:string;
  email:string;
  password:string;
}

@Component({
  selector: 'app-register',
  imports: [FormsModule,NgIf],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements AfterViewInit{
  user:User={
    firstName:"",
    lastName:"",
    email:"",
    password:""
  };
  http=inject(HttpClient);
  constructor(private authService:AuthService,private router:Router){}
  password:string=""
  ngAfterViewInit(): void {
    const button = document.getElementById('js-login-btn');
    const form = document.getElementById('js-login') as HTMLFormElement;

    if (button && form) {
      button.addEventListener('click', (event: Event) => {

        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
          form.classList.add('was-validated');
          return;
        }
        this.onRegister();
        
      });
    }
  }

  showToast = false;

  // OTP logic
  otp: string = '';
  otpError: string = '';
  // simulate correct OTP; in real app, you'd get this from server
  private correctOtp = '123456';

  // timers (in seconds)
  expirySeconds = 10 * 60;
  resendSeconds = 30;
  resendEnabled = false;

  private expiryInterval?: any;
  private resendInterval?: any;

  onRegister() {
    // ... your registration logic ...
    this.sendOTP();
    this.startOtpFlow();
    this.showToast = true;
  }

  hideToast() {
    this.clearTimers();
    this.showToast = false;
    this.resetFields();
  }

  submitOtp() {
    this.otpError = '';
    if (this.otp.length !== 6) {
      this.otpError = 'Please enter all 6 digits.';
      return;
    }
    const verify={email:this.user.email,otp:this.otp};
    this.http.post<{ message: string }>("https://localhost:7218/api/Auth/verify-otp",verify).subscribe((res:any)=>{
      if(res.message=='sucess'){
        this.http.post<{ message: string }>("https://localhost:7218/api/Auth/register",this.user).subscribe((res:any)=>{
          if(res.message=='success'){
            this.user.password="";
            this.authService.login(this.user,res.token);
            this.user.firstName="";
            this.user.lastName="";
            this.user.email="";
            this.hideToast();
            alert("Successfully Registered");
            this.router.navigate(['/home']);
          }
          else{
            alert(res.message);
          }
        // Optional: place your AJAX call or logic here
        });
      }
      else{
        this.otpError = 'Incorrect OTP, please try again.';
        alert('Some error ocurred try again');
      }
    });
    // success!
    // ... any further logic on successful OTP ...
    
  }
  sendOTP(){
    const email={ email:this.user.email}
    this.http.post<{ message: string }>("https://localhost:7218/api/Auth/send-otp",email).subscribe((res:any)=>{
      if(res.message=='OTP Sent'){
        // this.onRegister();
      }
      else{
        alert('Some error ocurred try again');
      }
    });
  }
  resendOtp() {
    if (!this.resendEnabled) return;
    // trigger resend (e.g. call backend)
    this.sendOTP();
    this.resetResendTimer();
    // optionally generate new correctOtp here
  }

  private startOtpFlow() {
    this.resetFields();
    this.startExpiryTimer();
    this.startResendTimer();
  }

  private resetFields() {
    this.otp = '';
    this.otpError = '';
    this.expirySeconds = 10 * 60;
    this.resendSeconds = 30;
    this.resendEnabled = false;
  }

  private startExpiryTimer() {
    this.expiryInterval = setInterval(() => {
      if (this.expirySeconds > 0) {
        this.expirySeconds--;
      } else {
        clearInterval(this.expiryInterval);
        this.otpError = 'OTP has expired. Please resend.';
      }
    }, 1000);
  }

  private startResendTimer() {
    this.resendEnabled = false;
    this.resendInterval = setInterval(() => {
      if (this.resendSeconds > 0) {
        this.resendSeconds--;
      } else {
        this.resendEnabled = true;
        clearInterval(this.resendInterval);
      }
    }, 1000);
  }

  private resetResendTimer() {
    clearInterval(this.resendInterval);
    this.resendSeconds = 30;
    this.resendEnabled = false;
    this.startResendTimer();
  }

  get expiryMinutes(): string {
    return Math.floor(this.expirySeconds / 60)
               .toString()
               .padStart(2, '0');
  }

  get expirySecondsDisplay(): string {
    return (this.expirySeconds % 60)
               .toString()
               .padStart(2, '0');
  }

  ngOnDestroy() {
    this.clearTimers();
  }

  private clearTimers() {
    clearInterval(this.expiryInterval);
    clearInterval(this.resendInterval);
  }

} 
