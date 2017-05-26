import { Component, ViewChild, ElementRef } from '@angular/core';
import { BotChatComponent } from './bot-chat/bot-chat.component';
import { ActivatedRoute, Router } from '@angular/router'
import { UserProfileService } from './core/user-profile.service';
import { CONFIG } from './core/config';
import { ConfigService } from './core/config.service';

@Component({
    selector: 'health-care-app',
    templateUrl: './app.component.html'
})
export class AppComponent {
    @ViewChild(BotChatComponent) botChatComponent: BotChatComponent;
    Guest: boolean;
    Meeting: string;

    constructor(
        private elem: ElementRef,
        private router: Router,
        private route: ActivatedRoute,
        private userProfileService: UserProfileService,
        private configService: ConfigService) {
        let attr = this.elem.nativeElement.getAttribute('Guest');

        let isGuestUser = attr ? <boolean>attr : false;

        this.Guest = isGuestUser;

        let meeting = this.elem.nativeElement.getAttribute('Meeting');

        if (meeting && meeting.length > 0) {
            this.Meeting = meeting;
            console.log(this.Meeting);
        }

        this.configService.getAppConfigs()
            .subscribe((configs) => {
                configs.forEach((config) => {
                    if (config.Key === 'ClientId') {
                        CONFIG.SkypeClientId = config.Value;
                    }
                });
            });
    }

    openBotPanel() {
        this.botChatComponent.showBotPanel();
        console.log('opened bot panel');
    }

    ngOnInit() {
        if (this.Guest && this.Meeting) {
            this.userProfileService.UserType = 'Patient';
            this.router.navigate(['/conference', this.Meeting]);
        }
    }
}