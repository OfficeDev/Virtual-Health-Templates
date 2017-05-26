import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { CONFIG } from './config';
import { Observable } from 'rxjs/Observable';
import { SpinnerService } from './spinner/spinner.service';
import { ExceptionService } from './exception.service';

export class Config {
    Key: string;
    Value: string;
}

@Injectable()
export class ConfigService {
    private _config: Config[];

    constructor(
        private http: Http,
        private spinnerService: SpinnerService,
        private exceptionService: ExceptionService) {
    }

    get CONFIG(): any {
        return this._config;
    }

    getAppConfigs() {
        this.spinnerService.show();
        return <Observable<Config[]>>this.http
            .get(CONFIG.AppSettings)
            .map((resp: Response) => {
                let configs = <Config[]>this.parseReponse(resp);
                if (configs) {
                    this._config = configs;
                }
                return this.parseReponse<Config[]>(resp);
            })
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
