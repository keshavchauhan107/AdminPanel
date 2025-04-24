import { Routes } from '@angular/router';
import { PrivacyComponent } from './components/privacy/privacy.component';
import { MarketingDashboardComponent } from './components/marketing-dashboard/marketing-dashboard.component';
import { AnalyticsDashboardComponent } from './components/analytics-dashboard/analytics-dashboard.component';
import { LoginComponent } from './components/authentication/login/login.component';
import { RegisterComponent } from './components/authentication/register/register.component';
import { ContactsComponent } from './components/contacts/contacts.component';
import { HomeComponent } from './components/home/home.component';
import { AuthGuard } from './auth/auth.guard';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { PageForgotComponent } from './components/authentication/page-forgot/page-forgot.component';
import { ResetPasswordComponent } from './components/authentication/reset-password/reset-password.component';

export const routes: Routes = [
    { path:"", redirectTo:"auth/login",pathMatch:"full"},
    { path:"home",component:HomeComponent,canActivate: [AuthGuard],children:[
        { path:"privacy",component:PrivacyComponent},
        { path:"marketing-dashboard",component:MarketingDashboardComponent},
        { path:"analytics-dashboard",component:AnalyticsDashboardComponent},
        { path:"contacts",component:ContactsComponent}
    ]},
    { path:"auth",children:[
        { path:"login",component:LoginComponent},
        { path:"register",component:RegisterComponent},
        { path:"changePassword",component:PageForgotComponent},
        { path:"resetPassword",component:ResetPasswordComponent}
    ]},
    { path:'**',component:PageNotFoundComponent}
    
];
