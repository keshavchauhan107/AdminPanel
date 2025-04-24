import { HttpClient, HttpParams } from '@angular/common/http';
import { AfterViewInit, Component, inject, Renderer2 } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-page-forgot',
  imports: [RouterLink, FormsModule],
  templateUrl: './page-forgot.component.html',
  styleUrl: './page-forgot.component.scss',
})
export class PageForgotComponent implements AfterViewInit {
  email: string = '';
  constructor(private renderer: Renderer2) {}
  http = inject(HttpClient);
  responseMessage:string="";
  ngAfterViewInit(): void {
    const loginForm = document.getElementById('js-login') as HTMLFormElement;
    const loginBtn = document.getElementById('js-login-btn') as HTMLButtonElement;
  
    if (loginForm && loginBtn) {
      loginForm.addEventListener('submit', (event) => {
        if (!loginForm.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        } else {
          event.preventDefault(); // stop real form submit
          loginForm.classList.add('was-validated');
  
          // Disable button and start timer
          loginBtn.disabled = true;
          this.onSubmit().then((message) => {
            console.log(message);
            // You can also set it to a property
            this.responseMessage = message;
            const container = loginBtn.parentElement!;
          loginBtn.disabled = true;
          alert(this.responseMessage);
          if(this.responseMessage!="Reset link sent to your email"){
            loginBtn.disabled = false;
            return;
          }
  
          let remaining = 30;
          const existingSpan = document.getElementById('retry-timer');
          if (!existingSpan) {
            const timerSpan = document.createElement('span');
            timerSpan.id = 'retry-timer';
            timerSpan.style.marginRight = '30px';
            timerSpan.textContent = `${remaining}s`;
            container.insertBefore(timerSpan, loginBtn);
            loginBtn.textContent="Resend Email";
  
            const intervalId = window.setInterval(() => {
              remaining--;
              if (remaining > 0) {
                timerSpan.textContent = `${remaining}s`;
              } else {
                loginBtn.disabled = false;
                timerSpan.remove();
                clearInterval(intervalId);
              }
            }, 1000);
          }
          });
          
        }
  
        loginForm.classList.add('was-validated');
      });
    }
  }
  

  onSubmit(): Promise<string> {
    const payload = { email: this.email };
  
    return this.http
      .post<{ message: string }>(
        'https://localhost:7218/api/Auth/forgot-password',
        payload
      )
      .toPromise()
      .then((res) => {
        return res?.message||"";
      })
      .catch((error) => {
        return 'Something went wrong.';
      });
  }
}
