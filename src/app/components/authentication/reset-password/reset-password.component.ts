import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, inject, OnInit} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

interface User {
  firstName: string;
  lastName:string;
  email:string;
  password:string;
}
@Component({
  selector: 'app-reset-password',
  imports: [RouterLink,FormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements AfterViewInit,OnInit {
  user:User={
    firstName:"",
    lastName:"",
    email:"",
    password:""
  };
  newPassword:string="";
  confirmPassword:string="";
  http=inject(HttpClient);
  onSubmit(){
    
  }

  token: string | null = null;

  constructor(private route: ActivatedRoute,private router:Router) {}

  ngOnInit() {
    // Option A: Snapshot (only works if params won’t change)
    // this.token = this.route.snapshot.queryParamMap.get('token');

    // Option B: Subscribe (reacts if the URL ever changes)
    this.route.queryParamMap
      .subscribe(params => {
        this.token = params.get('token');
      });
  }
  ngAfterViewInit(): void {
    const formEl = document.getElementById('passwordForm') as HTMLFormElement;
    const btn    = document.getElementById('js-submit-btn');
    const npwd   = document.getElementById('newPassword')    as HTMLInputElement;
    const cpwd   = document.getElementById('confirmPassword') as HTMLInputElement;

    if (btn && formEl && npwd && cpwd) {
      btn.addEventListener('click', (event) => {
        let valid = true;

        // 1) New password non‑empty?
        if (!npwd.value.trim()) {
          npwd.classList.add('is-invalid');
          valid = false;
        } else {
          npwd.classList.remove('is-invalid');
          npwd.classList.add('is-valid');
        }

        // 2) Confirm non‑empty?
        if (!cpwd.value.trim()) {
          cpwd.classList.add('is-invalid');
          valid = false;
        } else {
          cpwd.classList.remove('is-invalid');
          // we'll re‑check matching below
        }

        // 3) If both non‑empty, check they match
        if (npwd.value && cpwd.value && npwd.value !== cpwd.value) {
          cpwd.classList.add('is-invalid');
          valid = false;
        }
        else if (cpwd.value && npwd.value === cpwd.value) {
          cpwd.classList.remove('is-invalid');
          cpwd.classList.add('is-valid');
        }
        // Add Bootstrap validation style
        formEl.classList.add('was-validated');

        // Prevent submission if invalid
        if (!valid) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        console.log(this.newPassword);
        this.user.password=this.newPassword;
        this.http.post<{ message: string }>("https://localhost:7218/api/Auth/reset-password",this.user, {
          headers: {
            Authorization: `Bearer ${this.token}`
          }}).subscribe((res:any)=>{
            if(res.message=="success"){
              alert("Password Succesfully updated");
              this.router.navigate(['/auth/login']);
            }
            else{
              alert(res.message);
            }
        // Optional: place your AJAX call or logic here
        });
      });

    }
  }
}
