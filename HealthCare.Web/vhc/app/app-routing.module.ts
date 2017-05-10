import { NgModule } from '@angular/core';
import { PreloadAllModules, Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ErrorComponent } from './error/error.component';
import { BookMeetingComponent } from './book-meeting/book-meeting.component';
import { ConferenceComponent } from './video-conference/conference.component';
import { StopSceensComponent } from './stop-screens/stop-screens.component';
import { CanActivateAuthGuard } from '../app/core/can-activate.service';

const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    { path: 'dashboard', pathMatch: 'full', component: DashboardComponent, canActivate: [CanActivateAuthGuard] },
    { path: 'book-meeting', loadChildren:'app/book-meeting/bookmeeting.module#BookMeetingModule', canActivate: [CanActivateAuthGuard] },
    { path: 'conference/:meetingUri', pathMatch: 'full', component: ConferenceComponent, canActivate: [CanActivateAuthGuard] },
    { path: 'configuration', loadChildren:'app/configuration/configuration.module#ConfigurationModule', canActivate: [CanActivateAuthGuard] },
    { path: 'error', component: ErrorComponent },
    { path: 'thank-you', component: StopSceensComponent },
    { path: '**', redirectTo: 'dashboard' }
];


@NgModule({
    imports: [RouterModule.forRoot(routes, {preloadingStrategy:PreloadAllModules })],
    exports: [RouterModule]
})

export class AppRoutingModule { }

export const RoutableComponents = [
    DashboardComponent,
    ErrorComponent,
    ConferenceComponent,
    StopSceensComponent
];