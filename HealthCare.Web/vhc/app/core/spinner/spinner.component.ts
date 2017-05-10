import { Component, OnDestroy, OnInit, NgZone } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { SpinnerState, SpinnerService } from './spinner.service';

declare var fabric: any;

@Component({
    selector: 'fabric-spinner',
    templateUrl: './spinner.component.html',
    styleUrls: ['./spinner.component.css']
})
export class SpinnerComponent implements OnDestroy, OnInit {
    visible = false;

    private spinnerStateChanged: Subscription;

    constructor(
        private spinnerService: SpinnerService,
        private zone: NgZone) { }

    ngOnInit() {
        let that = this;
        this.spinnerStateChanged = this.spinnerService.spinnerState
            .subscribe((state: SpinnerState) => this.zone.run(() => that.visible = state.show));
    }

    ngOnDestroy() {
        this.spinnerStateChanged.unsubscribe();
    }
}

