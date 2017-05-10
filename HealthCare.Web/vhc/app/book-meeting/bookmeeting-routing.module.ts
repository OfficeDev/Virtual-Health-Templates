import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BookMeetingComponent } from './book-meeting.component';

const routes: Routes = [
    {
        path: '',
        component: BookMeetingComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class BookMeetingRoutingModule { }

export const routedComponents = [BookMeetingComponent];