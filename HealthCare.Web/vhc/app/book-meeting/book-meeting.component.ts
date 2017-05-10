import { Component, OnInit, ElementRef, Renderer2 } from '@angular/core';
import { Breadcrumb } from '../shared/models/breadcrumb.model';
import { Appointment } from '../shared/models/appointment.model';
import { MeetingService } from '../dashboard/meeting.service';
import { Questionnaire } from '../shared/models/questionnaire.model';
import { ToastService } from '../core/toast/toast.service';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { CONFIG } from '../core/config';

declare var fabric: any;
declare var $: any;


@Component({
    selector: 'book-meeting',
    templateUrl: './book-meeting.component.html'
})
export class BookMeetingComponent implements OnInit {
    breadcrumbs: Array<Breadcrumb> = [];
    bookingTextLabel: string = 'Booking Date';
    timeSlots: Array<string> = [];
    appt: Appointment;
    questionnaires: Array<Questionnaire> = [];
    datePicker: any;
    loaded: boolean = false;
    hasSelectedQuestionnaire = false;
    formError: boolean = false;
    errorMessage: string;

    constructor(
        private elem: ElementRef,
        private meetingService: MeetingService,
        private renderer: Renderer2,
        private toastService: ToastService,
        private router: Router) {
    }


    ngOnInit() {
        this.appt = new Appointment();
        this.appt.Questionnaire = this.appt.TimeSlot = '';

        this.breadcrumbs = [
            { linkName: 'Home', routerLink: '/dashboard' },
            { linkName: 'Book Meeting', routerLink: '/book-meeting' }
        ];

        this.meetingService.getQuestionnaires()
            .subscribe((questionnaires) => {
                this.questionnaires = questionnaires;
                this.activateFabricUi();
            }, () => { },
            () => { this.loaded = true; });

        this.timeSlots = CONFIG.TimeSlots
    }

    dateChanged(date: any) {
        console.log(date);
    }

    get diagnostic() {
        return JSON.stringify(this.appt);
    }

    bookMeeting(form: NgForm) {
        if (this.appt.TimeSlot
            && this.appt.Questionnaire
            && this.appt.Email
            && this.appt.FullName
        ) {
            this.formError = true;
            this.appt.Date = this.getBookingDate();

            if (this.appt.Date) {
                this.meetingService
                    .saveMeeting(this.appt)
                    .subscribe((success) => {
                        if (success) {
                            this.toastService.activate("Your booking has been made. You should recieve an email invitation shortly.");
                            this.formError = true;
                            form.resetForm();
                            this.router.navigate(["/dashboard"]);
                        } else {
                            this.formError = true;
                            this.errorMessage = 'We were unable to book your meeting. Please make sure you have selected a future date !!';

                            this.toastService.activate("Booking could not be completed. Please try again!!");
                        }
                    },
                    (error) => this.toastService.activate(error));

            }
        }
    }

    private activateFabricUi(): void {
        if (this.elem) {
            let elements = this.elem.nativeElement.querySelectorAll('.ms-Dropdown');
            setTimeout(() => {
                for (let element of elements) {
                    new fabric['Dropdown'](element);
                }
            }, 100);

            let dtElements = this.elem.nativeElement.querySelectorAll('.ms-DatePicker');
            setTimeout(() => {
                for (let element of dtElements) {
                    new fabric['DatePicker'](element);
                }
            }, 100);
        }
    }

    /**
     * angular binding does not work for date picker | Office UI Fabric Js issue
     */
    private getBookingDate() {
        let dateField = this.renderer.selectRootElement('#bookingDate');
        if (dateField) {
            let dateString = $(dateField).val();
            if (dateString) {
                try {
                    this.errorMessage = '';
                    this.formError = false;
                    let date = new Date(dateString)
                    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
                } catch (error) {
                    this.formError = true;
                    this.errorMessage = 'Please provide a valid booking date.';
                }
            } else {
                this.formError = true;
                this.errorMessage = 'Please provide a valid booking date.';
            }
        } else {
            this.formError = true;
            this.errorMessage = 'Please provide a valid booking date.';
        }
    }
}
