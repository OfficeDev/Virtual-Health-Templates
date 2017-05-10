import { Optional, SkipSelf } from '@angular/core';
import { CONFIG } from '../core/config';

export class LoggerService {

    constructor( @Optional() @SkipSelf() prior: LoggerService) {
        if (prior) {
            console.log('Logger service already exists');
            return prior;
        } else {
            console.log('Created Logger service');
        }
    }

    log(message: string) {
        console.log(`${CONFIG.ErrorPrefix.SkypeLog} ${message}`);
    }

    error(message: any) {
        console.error(`${CONFIG.ErrorPrefix.SkypeErrorPrefix} `, message);
    }
}