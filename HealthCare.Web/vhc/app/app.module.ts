import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { SharedModule } from './shared/shared.module';
import { HttpModule } from '@angular/http';
import { AppRoutingModule, RoutableComponents } from './app-routing.module';
import { AppComponent } from './app.component';
import { MeetingService } from './dashboard/meeting.service';
import { ConferenceService } from './video-conference/conference.service';
import { CoreModule } from './core/core.module';
import './core/rxjs-extensions';
import { Ng2PaginationModule } from 'ng2-pagination';
import { MomentModule } from 'angular2-moment';
import { BotChatComponent } from './bot-chat/bot-chat.component';
import { StopSceensComponent } from './stop-screens/stop-screens.component';
import { SkypeService } from './video-conference/skype.service';
import { SkypeUIConnector } from './video-conference/skype-ui-connector.service';
import { TrustedApiService } from './video-conference/trustedapi.service';
import { SignalRUIConnector } from './video-conference/signalr-ui-connector';


@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        SharedModule,
        AppRoutingModule,
        HttpModule,
        CoreModule,
        Ng2PaginationModule,
        MomentModule
    ],
    declarations: [
        AppComponent,
        RoutableComponents,
        BotChatComponent
    ],
    bootstrap: [AppComponent],
    providers: [
        MeetingService,
        ConferenceService,
        SkypeService,
        SkypeUIConnector,
        TrustedApiService,
        SignalRUIConnector
    ]
})
export class AppModule { }
