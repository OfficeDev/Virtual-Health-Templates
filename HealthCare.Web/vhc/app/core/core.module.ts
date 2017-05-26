import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ToastModule } from './toast/toast.module';
import { SpinnerModule } from './spinner/spinner.module';

import { ExceptionService } from './exception.service';
import { UserProfileService } from './user-profile.service';
import { FilterListService } from './filter.service';
import { throwIfAlreadyLoaded } from './module-import-guard';
import { LoggerService } from '../core/logger.service';
import { ConfigService } from '../core/config.service';
import { CanActivateAuthGuard } from '../core/can-activate.service';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        SpinnerModule,
        ToastModule
    ],
    exports: [
        CommonModule,
        FormsModule,
        RouterModule,
        SpinnerModule,
        ToastModule
    ],
    providers: [
        ExceptionService,
        FilterListService,
        UserProfileService,
        LoggerService,
        ConfigService,
        CanActivateAuthGuard
    ]
})

export class CoreModule {
    constructor( @Optional() @SkipSelf() parentModule: CoreModule) {
        throwIfAlreadyLoaded(parentModule, 'CoreModule');
    }
}