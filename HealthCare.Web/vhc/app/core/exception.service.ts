import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { ToastService } from './toast/toast.service';
import { Router } from '@angular/router'

@Injectable()
export class ExceptionService {
    constructor(private toastService: ToastService, private router: Router) { }

    catchBadResponse: (errorResponse: any) => Observable<any> = (errorResponse: any) => {
        let res = <Response>errorResponse;
        let err = res.json();
        let emsg = err ?
            (err.error ? err.error : JSON.stringify(err)) :
            (res.statusText || 'unknown error');
        this.toastService.activate(`Error - Bad Response - ${emsg}`);
        return Observable.of(false);
    };

    showErrorScreen(error: any) {
        this.router.navigate(['/error']);
        console.log(error);
    }
}
