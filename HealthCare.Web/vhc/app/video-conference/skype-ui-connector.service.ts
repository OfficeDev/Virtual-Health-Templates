/*
  Skype UI Connector -> Subscribes & Dispatches  to skype events
*/
import { Injectable, Optional, SkipSelf } from '@angular/core';
import { Subject } from 'rxjs/Subject';

export interface SkypeLoaderMessage {
    message: string;
    showLoader: boolean;
}

export interface SkypeMember {
    Id: string;
    DisplayName: string;
    Email: string;
    Operation: SkypeMemberOperation,
    Status : SkypeMemberStatus
}

export enum SkypeMemberOperation {
    Add,
    Remove,
    AddToLobby
}

export enum SkypeMemberStatus {
    Active,
    Offline,
    InLobby
}

export class SkypeControls {
    enabled: boolean
    message: string;
    type: SkypeControlType
}

export enum SkypeControlType {
    Audio,
    Video,
    Conversation
}

export class SkypeVideo {
    DisplayName: string;
    Id: string;
    Reset: boolean;
}

export class SkypeMessage {
    SenderName: string;
    SenderId: string;
    Status: string;
    Html: string;
    Message: string;
    TimeStamp: Date;
    UnRead: boolean;
}

export class SkypeDevices {
    Name: string;
    Id: string;
    Selected: boolean;
}

@Injectable()
export class SkypeUIConnector {
    private skypeLoaderSubject = new Subject<SkypeLoaderMessage>();
    private skypeConversationSubject = new Subject<number>();
    private skypeMemberSubject = new Subject<SkypeMember>();
    private skypeControlsSubject = new Subject<SkypeControls>();
    private skypeVideoSubject = new Subject<SkypeVideo>();
    private skypeMessageSubject = new Subject<SkypeMessage>();


    skypeLoader = this.skypeLoaderSubject.asObservable();
    skypeParticipants = this.skypeConversationSubject.asObservable();
    skypeMembers = this.skypeMemberSubject.asObservable();
    skypeControls = this.skypeControlsSubject.asObservable();
    skypeVideo = this.skypeVideoSubject.asObservable();
    skypeMessages = this.skypeMessageSubject.asObservable();

    constructor( @Optional() @SkipSelf() prior: SkypeUIConnector) {
        if (prior) { return prior; }
    }

    show(skypeLoaderMessage: SkypeLoaderMessage) {
        this.skypeLoaderSubject.next(<SkypeLoaderMessage>{ message: skypeLoaderMessage.message, showLoader: true });
    }

    hide(skypeLoaderMessage: SkypeLoaderMessage) {
        this.skypeLoaderSubject.next(<SkypeLoaderMessage>{ message: '', showLoader: false });
    }

    updateParticipantCount(participantCount: number) {
        this.skypeConversationSubject.next(participantCount);
    }

    skypeMemberUpdate(skypeMember: SkypeMember) {
        this.skypeMemberSubject.next(skypeMember);
    }

    updateSkypeControls(skypeControls: SkypeControls) {
        this.skypeControlsSubject.next(skypeControls);
    }

    addRemoveSkypeVideo(skypeVideo: SkypeVideo) {
        this.skypeVideoSubject.next(skypeVideo);
    }

    publishSkypeMessage(skypeMessage: SkypeMessage) {
        this.skypeMessageSubject.next(skypeMessage);
    }
}
