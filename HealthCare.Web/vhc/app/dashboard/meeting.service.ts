import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Meeting } from '../shared/models/meeting.model';
import { Questionnaire } from '../shared/models/questionnaire.model';
import { Appointment } from '../shared/models/appointment.model';
import { SpinnerService } from '../core/spinner/spinner.service';
import { ExceptionService } from '../core/exception.service';
import { CONFIG } from '../core/config';

@Injectable()
export class MeetingService {
    constructor(
        private http: Http,
        private spinnerService: SpinnerService,
        private exceptionService: ExceptionService) {
    }

    getMeetings() {
        this.spinnerService.show();
        return <Observable<Meeting[]>>this.http
            .get(CONFIG.BaseUrls.Appointments)
            .map((resp: Response) => this.parseReponse<Meeting[]>(resp))
            .catch(this.exceptionService.catchBadResponse)
            .finally(() => this.spinnerService.hide());

    }

    getQuestionnaires() {
        this.spinnerService.show();
        return <Observable<Questionnaire[]>>this.http
            .get(CONFIG.BaseUrls.Questionnaires)
            .map((resp: Response) => this.parseReponse<Questionnaire>(resp))
            .catch(this.exceptionService.catchBadResponse)
            .finally(() => this.spinnerService.hide());
    }

    getBotEmbedUrl() {
        this.spinnerService.show();
        return <Observable<string>>this.http
            .get(CONFIG.BaseUrls.BotToken)
            .map((resp: Response) => this.parseReponse<string>(resp))
            .catch(this.exceptionService.catchBadResponse)
            .finally(() => this.spinnerService.hide());
    }

    saveMeeting(appt: Appointment) {
        let body = JSON.stringify(appt);
        const headers = new Headers({ 'Content-Type': 'application/json' });
        const options = new RequestOptions({ headers: headers });

        this.spinnerService.show();
        return <Observable<boolean>>this.http
            .post(CONFIG.BaseUrls.SaveAppointment, body, options)
            .map((resp: Response) => this.parseReponse<boolean>(resp))
            .catch(this.exceptionService.catchBadResponse)
            .finally(() => this.spinnerService.hide());
    }

    sendInvite(appt: Appointment) {
        let body = JSON.stringify(appt);
        const headers = new Headers({ 'Content-Type': 'application/json' });
        const options = new RequestOptions({ headers: headers });

        this.spinnerService.show();
        return <Observable<boolean>>this.http
            .post(CONFIG.BaseUrls.EmailInvite, body, options)
            .map((resp: Response) => this.parseReponse<boolean>(resp))
            .catch(this.exceptionService.catchBadResponse)
            .finally(() => this.spinnerService.hide());
    }

    private parseReponse<T>(res: Response) {
        if (!res.ok) {
            throw new Error('Bad response status: ' + res.status);
        }
        let body = res.json ? res.json() : null;
        let resp = <T>(body || {});
        return resp;
    }
}


