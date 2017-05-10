import { Injectable, Optional, SkipSelf } from '@angular/core';
import { Subject } from 'rxjs/Subject';

export class SignalRUIConnector {
    private desktopShareStarted = new Subject<boolean>();

    desktopShared = this.desktopShareStarted.asObservable();

    sendDesktopShareStartedMessage(desktopShared: boolean) {
        this.desktopShareStarted.next(desktopShared);
    }
}