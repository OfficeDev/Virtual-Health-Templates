import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';

import { throwIfAlreadyLoaded } from '../module-import-guard';
import { ToastComponent } from './toast.component';
import { ToastService } from './toast.service';

@NgModule({
    imports: [CommonModule],
    exports: [ToastComponent],
    declarations: [ToastComponent],
    providers: [ToastService]
})
export class ToastModule {
    constructor( @Optional() @SkipSelf() parentModule: ToastModule) {
        throwIfAlreadyLoaded(parentModule, 'ToastModule');
    }
}


/*
Copyright 2016 JohnPapa.net, LLC. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://bit.ly/l1cense
*/
