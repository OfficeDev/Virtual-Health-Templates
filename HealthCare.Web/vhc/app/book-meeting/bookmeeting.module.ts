import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { BookMeetingRoutingModule, routedComponents } from './bookmeeting-routing.module';

@NgModule({
    imports: [BookMeetingRoutingModule, SharedModule, FormsModule, CommonModule],
    declarations: [routedComponents]
})
export class BookMeetingModule { }