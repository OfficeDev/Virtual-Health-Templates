import { Component, OnInit } from '@angular/core';
import { Breadcrumb } from '../shared/models/breadcrumb.model';
import { Meeting } from '../shared/models/meeting.model';
import { MeetingMetadata } from '../shared/models/meeting-metadata.model';
import { MeetingService } from './meeting.service';
import { ConferenceService } from '../video-conference/conference.service';
import { FilterListService } from '../core/filter.service';
@Component({
    selector: 'dashboard',
    templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
    breadcrumbs: Array<Breadcrumb> = [];
    meetings: Meeting[];
    filteredMeetings: Meeting[];
    filter: string;

    constructor(
        private meetingService: MeetingService,
        private conferenceService: ConferenceService,
        private filterService: FilterListService) {
        this.breadcrumbs = [
            { linkName: 'Home', routerLink: '/dashboard' }
        ];
    }

    ngOnInit() {
        this.meetings = [];
        this.meetingService
            .getMeetings()
            .subscribe(meetings => {
                this.meetings = this.filteredMeetings = meetings;
            }, () => {
                this.meetings = this.filteredMeetings = [];
            });
    }

    filterChanged(searchText: string) {
        this.filteredMeetings = this.filterService.filter(searchText, ['PatientName'], this.meetings);
        console.log(this.filteredMeetings);
    }
}
