import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Configuration } from './configuration.model';
import { SpinnerService } from '../core/spinner/spinner.service';
import { ExceptionService } from '../core/exception.service';
let configUrl = '/api/healthcare/configuration';

@Injectable()
export class ConfigurationService {
    constructor(
        private http: Http,
        private spinnerService: SpinnerService,
        private exceptionService: ExceptionService
    ) {
    }

    getConfiguration() {
        this.spinnerService.show();
        return this.http
            .get(configUrl)
            .map((response: Response) => this.extractData(response))
            .catch(this.exceptionService.catchBadResponse)
            .finally(() => this.spinnerService.hide());
    }

    saveConfiguation(configuration: Configuration) {
        let data: any = {};
        data = this.prepareData(configuration);
        let body = JSON.stringify(data);
        const headers = new Headers({ 'Content-Type': 'application/json' });
        const options = new RequestOptions({ headers: headers });

        this.spinnerService.show();
        return <Observable<Response>>this.http
            .post(configUrl, body, options)
            .catch(this.exceptionService.catchBadResponse)
            .finally(() => this.spinnerService.hide());
    }

    private extractData(response: Response) {
        if (!response.ok) {
            throw new Error('Bad response status :' + response.status);
        }

        let body = response.json ? response.json() : null;
        return this.mapConfiguration(body);
    }


    private mapConfiguration(jsonObject: any): Configuration {
        if (jsonObject) {
            let configuraton = new Configuration();

            for (let prop of jsonObject) {
                switch (prop.Key) {
                    case 'AllowLobby':
                        configuraton.AllowLobby = (prop.Value.toLocaleLowerCase() === 'true');
                        break;
                    case 'MeetingOpenModeInBrowser':
                        configuraton.MeetingOpenModeInBrowser = (prop.Value.toLocaleLowerCase() === 'true');
                        break;
                    case 'CalculateBandwidthDuringConference':
                        configuraton.CalculateBandwidthDuringConference = (prop.Value.toLocaleLowerCase() === 'true');
                        break;
                    case 'TimeOfJoiningCall':
                        configuraton.TimeOfJoiningCall = (prop.Value.toLocaleLowerCase() === 'true');
                        break;
                    case 'AllowPeerChatControl':
                        configuraton.AllowPeerChatControl = (prop.Value.toLocaleLowerCase() === 'true');
                        break;
                    case 'AllowTrustedApiMeeting':
                        configuraton.AllowTrustedApiMeeting = (prop.Value.toLocaleLowerCase() === 'true');
                        break;
                    case 'DefaultBrowser': configuraton.DefaultBrowser = prop.Value;
                        break;
                }
            }
            return configuraton;
        }
    }


    private prepareData(configuration: Configuration): Array<any> {
        let configs: Array<any> = [];

        // TODO: Convert to boolean rather than 'True/False' string values
        for (let prop in configuration) {
            if (!configuration.hasOwnProperty(prop)) {
                continue;
            }

            let configItem: any = {};
            configItem.Key = prop;
            if (prop === 'DefaultBrowser') {
                configItem.Value = configuration[prop];
            } else {
                configItem.Value = configuration[prop] != null ? (configuration[prop] ? 'True' : 'False') : 'False';
            }
            configs.push(configItem);
        }


        return configs;
    }
}


