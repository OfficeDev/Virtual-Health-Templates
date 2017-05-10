import { Injectable, Optional, SkipSelf } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { ExceptionService } from '../core/exception.service';
import { SpinnerService } from '../core/spinner/spinner.service';
import { CONFIG } from '../core/config';
import { Observable } from 'rxjs/Observable'

export class TrustedApiOptions {
    Token: string;
    DiscoverUri: string;
    TenantEndpointId: string;
    DisplayName: string;

    constructor(token: string = '',
        discoverUri: string = '',
        tenantEndpoint: string = '', displayName = 'Guest-') {
        this.Token = token;
        this.DiscoverUri = discoverUri;
        this.TenantEndpointId = tenantEndpoint;
        this.DisplayName = (displayName === 'Guest-') ? displayName + Math.floor((Math.random() * 20) + 1) : displayName;
    }

    public get Options() { 
        return {
            name: this.DisplayName,
            token: 'Bearer ' + this.Token,
            root: {
                user: this.DiscoverUri
            },
            cors: true
        }
    }
}

@Injectable()
export class TrustedApiService {
    AllowedOrigins: string;
    MeetingUrl: string;
    ApplicationSessionId: string;

    constructor(
        @Optional() @SkipSelf() prior: TrustedApiService,
        private http: Http,
        private exceptionService: ExceptionService,
        private spinnerService: SpinnerService) {
        if (prior) { return prior; }
    }

    requestAnonymousToken(allowedOrigins: string, meetingUrl: string) {
        this.spinnerService.show();
        let data: any = {
            ApplicationSessionId: 'VIRTUAL' + new Date().getTime(),
            AllowedOrigins: allowedOrigins,
            MeetingUrl: meetingUrl
        };
        let body = JSON.stringify(data);
        const headers = new Headers({ 'Content-Type': 'application/json' });
        const options = new RequestOptions({ headers: headers });


        return <Observable<TrustedApiOptions>>this.http
            .post(CONFIG.TrustedApi.AnonymousToken, body, options)
            .map((resp: Response) => <TrustedApiOptions>this.parseResponse(resp))
            .catch(this.exceptionService.catchBadResponse)
            .finally(() => this.spinnerService.hide());
    }

    private parseResponse<T>(res: Response) {
        if (!res.ok) {
            throw new Error('Bad response status: ' + res.status);
        }
        let body = res.json ? res.json() : null;
        var resp = <T>(body || {});
        return resp;
    }
}


