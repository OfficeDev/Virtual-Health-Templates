import { Component, ElementRef, OnInit } from '@angular/core';
import { MeetingService } from '../dashboard/meeting.service';

declare var fabric: any;

@Component({
    selector: 'bot-chat',
    templateUrl: './bot-chat.component.html'
})
export class BotChatComponent implements OnInit {
    panel: any;
    showBotFrame: boolean;
    embedUrl: string;
    botError: boolean;

    constructor(
        private elem: ElementRef,
        private meetingService: MeetingService) {
        this.showBotFrame = false;
        this.botError = false;
    }

    showBotPanel() {
        if (this.panel) {
            this.showBotFrame = true;
            new fabric['Panel'](this.panel);
        }
    }

    ngOnInit() {
        this.meetingService
            .getBotEmbedUrl()
            .subscribe((embedUrl) => {
                this.embedUrl = embedUrl;
            },
            () => { this.botError = true; }, () => this.activateFabricUi());
    }

    activateFabricUi() {
        let that = this;

        setTimeout(() => {
            that.panel = this.elem.nativeElement.querySelector('.ms-Panel');
        }, 200);
    }

}
