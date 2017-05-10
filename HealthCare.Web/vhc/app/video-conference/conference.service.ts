import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { SpinnerService } from '../core/spinner/spinner.service';
import { ExceptionService } from '../core/exception.service';
import { MeetingMetadata } from '../shared/models/meeting-metadata.model';
import { Peer } from '../shared/models/peer.model';
import { MeetingDetails } from '../shared/models/meeting-details.model';
import { CONFIG } from '../core/config';

@Injectable()
export class ConferenceService {

    constructor(
        private http: Http,
        private spinnerService: SpinnerService,
        private exceptionService: ExceptionService) {

    }

    getMeetingMetadata(uriEncrypted: string) {
        var url = CONFIG.BaseUrls.MeetingMetadata + "?encryptedData=" + uriEncrypted;
        this.spinnerService.show();
        return <Observable<MeetingMetadata>>this.http
            .get(url)
            .map((resp: Response) => this.parseReponse<MeetingMetadata>(resp))
            .catch(this.exceptionService.catchBadResponse)
            .finally(() => this.spinnerService.hide());
    }

    getDoctors() {
        this.spinnerService.show();
        return <Observable<Peer[]>>this.http
            .get(CONFIG.BaseUrls.Doctors)
            .map((resp: Response) => this.parseReponse<Peer[]>(resp))
            .catch(this.exceptionService.catchBadResponse)
            .finally(() => this.spinnerService.hide());
    }

    getLeaders() {
        this.spinnerService.show();
        return <Observable<Peer[]>>this.http
            .get(CONFIG.BaseUrls.Leaders)
            .map((resp: Response) => this.parseReponse<Peer[]>(resp))
            .catch(this.exceptionService.catchBadResponse)
            .finally(() => this.spinnerService.hide());
    }

    getMeetingDetails(meetingId: number) {
        var url = CONFIG.BaseUrls.MeetingDetails + "?meetingId=" + meetingId;
        this.spinnerService.show();
        return <Observable<MeetingDetails>>this.http
            .get(url)
            .map((resp: Response) => this.parseReponse<MeetingMetadata>(resp))
            .catch(this.exceptionService.catchBadResponse)
            .finally(() => this.spinnerService.hide());
    }

    checkTimeOfJoining(itemId: string) {
        let d = new Date();
        var n = d.getTimezoneOffset();
        let url = CONFIG.BaseUrls.CheckTimeOfJoining + '?itemId=' + itemId + '&offsetTime=' + n;
        this.spinnerService.show();
        return <Observable<boolean>>this.http
            .get(url)
            .map((resp: Response) => {
                if (!resp.ok) {
                    throw new Error('Bad response status: ' + resp.status);
                }
                let body = resp.json ? (resp.json() == true ? true : false) : false;
                return body;
            }).catch(this.exceptionService.catchBadResponse)
            .finally(() => this.spinnerService.hide());

    }

    private parseReponse<T>(res: Response) {
        if (!res.ok) {
            throw new Error('Bad response status: ' + res.status);
        }
        let body = res.json ? res.json() : null;
        var resp = <T>(body || {});
        return resp;
    }



}