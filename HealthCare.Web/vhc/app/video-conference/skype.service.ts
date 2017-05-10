import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { CONFIG } from '../core/config';
import { ExceptionService } from '../core/exception.service';
import { ToastService } from '../core/toast/toast.service';
import { UserProfileService } from '../core/user-profile.service';
import {
    SkypeUIConnector, SkypeLoaderMessage, SkypeMember, SkypeMemberOperation, SkypeMemberStatus,
    SkypeControls, SkypeControlType, SkypeVideo, SkypeMessage, SkypeDevices
} from './skype-ui-connector.service';

import { SkypePeople } from '../shared/models/skype-people.model';

declare var Skype: any;

@Injectable()
export class SkypeService {
    skypeWebAppCtor: any;
    skypeWebApp: any;
    client: any
    chatClient: any;
    conversation: any;
    chatServicePatient: any;
    accessToken: string;

    constructor(
        private toastrService: ToastService,
        private userProfileService: UserProfileService,
        private http: Http,
        private skypeConnector: SkypeUIConnector,
        private exceptionService: ExceptionService) {
    }

    setToken(key: string) {
        if (key.length) {
            this.accessToken = key;
        }
    }

    InitSkype(meetingUri: string, options?: any) {
        let that = this;
        this.skypeConnector.show(<SkypeLoaderMessage>{
            message: "We will start your virtual visit soon.",
            showLoader: true
        });
        Skype.initialize({ apiKey: CONFIG.SkypeApiKey }, function (api: any) {
            that.skypeWebAppCtor = api.application;
            that.skypeWebApp = new api.application();
            that.client = new that.skypeWebAppCtor;
            if (options) {
                console.log(CONFIG.ErrorPrefix.SkypeEvents + 'Using Trusted Api');
                that.SkypeSignIn(meetingUri, options);
            } else {
                console.log(CONFIG.ErrorPrefix.SkypeEvents + 'Using Skype Api');
                that.SkypeSignIn(meetingUri);
            }
        }, function (error: any) {
            that.toastrService.activate("Cannot Load Skype SDK.");
        });
    }

    private SkypeSignIn(meetingUri?: string, apiOptions?: any) {
        let that = this;
        let options = {
            "client_id": CONFIG.SkypeClientId,
            "origins": ["https://webdir.online.lync.com/autodiscover/autodiscoverservice.svc/root"],
            "cors": true,
            "version": 'VirtualHealthTemplates/1.0.0.0',
            "redirect_uri": '/token.html'
        }

        if (apiOptions) {
            options = apiOptions;
        }
        console.log(options);
        //TODO: Check Trusted API token
        this.skypeConnector.show(<SkypeLoaderMessage>{
            message: "We will start your virtual visit soon.",
            showLoader: true
        });
        this.client.signInManager.signIn(
            options
        ).then(function () {
            let email = that.client.personsAndGroupsManager.mePerson.email();
            let displayName = that.client.personsAndGroupsManager.mePerson.displayName();
            that.toastrService.activate('Successfully signed into Virtual Health Care(VHC) as ' + displayName);

            /* Logged In -> We can join conference now */
            that.JoinConference(meetingUri);
        }, function (error: any) {
            that.exceptionService.showErrorScreen(error);
        });
    }

    private JoinConference(meetingUri: string) {
        let that = this;
        this.conversation = this.client.conversationsManager.getConversationByUri(meetingUri);

        this.client.conversationsManager.conversations.added((conversation: any, baseClass: any) => this.HandleConversationEvents(conversation, that));

        let id = this.conversation.selfParticipant.person.id();
        id = id.substring(id.indexOf('sip:') + 4, id.indexOf("@"));

        this.conversation.chatService.start().then(function () {
            console.log(`${CONFIG.ErrorPrefix.SkypeLog}Chat Service Started`)
            that.chatServicePatient = that.conversation.chatService;

            that.conversation.historyService.activityItems.added(function (message: any) {
                if (message.type() === 'TextMessage') {
                    that.parseSkypeMessages(message).then((skypeMessage: any) => {
                        that.skypeConnector.publishSkypeMessage(skypeMessage);
                    }, (error: any) => {
                        console.log(error);
                        console.log(`${CONFIG.ErrorPrefix.SkypeLog} Skype Message Parse Error`);
                    });
                }
            });
        });

        this.SubscribeToDevices();
    }

    private SubscribeToDevices() {
        this.client.devicesManager.cameras.subscribe();
        this.client.devicesManager.microphones.subscribe();
        this.client.devicesManager.speakers.subscribe();
    }

    private ChatSignIn() {
        let that = <SkypeService>this;
        var options = {
            "client_id": CONFIG.SkypeClientId,
            "origins": ["https://webdir.online.lync.com/autodiscover/autodiscoverservice.svc/root"],
            "cors": true, "version": 'VirtualHealthTemplates/1.0.0.0',
            "redirect_uri": '/token.html'
        }

        //TODO: Check Trusted API token
        this.chatClient = new this.skypeWebAppCtor;

        this.chatClient.signInManager.signIn(
            options
        ).then(function () {
            let displayName = that.chatClient.personsAndGroupsManager.mePerson.displayName();
            that.toastrService.activate('Successfully signed into Virtual Health Care(VHC) Chat as ' + displayName);
        }, function (error: any) {
            that.toastrService.activate('Error starting chat ' + error);
        });
    }

    private HandleConversationEvents(conversation: any, baseClass: any) {
        let that = <SkypeService>baseClass;
        let skypeConnector = <SkypeUIConnector>that.skypeConnector;
        let userProfileService = <UserProfileService>that.userProfileService;

        conversation.state.once("Disconnected", function () {
            that.toastrService.activate('Disconnected from conversation !!');
            skypeConnector.updateSkypeControls(<SkypeControls>{
                type: SkypeControlType.Conversation,
                enabled: false
            });
        });

        conversation.state.once("Conferenced", function () {
            that.toastrService.activate(`You've connected to the conversation!!`);
            skypeConnector.updateSkypeControls(<SkypeControls>{
                type: SkypeControlType.Conversation,
                enabled: true
            });
        });

        /* Self Participant */
        conversation.selfParticipant.state.changed(function (state: string, reason: any, oldState: string) {
            console.log(CONFIG.ErrorPrefix.SkypeLog + "Self participant state - " + state);
            if (state === "InLobby") {
                skypeConnector.show(<SkypeLoaderMessage>{
                    message: "We will start your virtual visit soon. Please wait for a health care professional to admit you to the meeting.",
                    showLoader: true
                });
            }
            else if (state === 'Connected') {
                skypeConnector.show(<SkypeLoaderMessage>{
                    message: "We are almost there. Starting Video Service",
                    showLoader: true
                });

                skypeConnector.updateSkypeControls(<SkypeControls>{
                    type: SkypeControlType.Conversation,
                    enabled: true
                });

                if (userProfileService.IsDoctor()) {
                    if (conversation.videoService.state() !== 'Connected') {
                        conversation.videoService.start().then(function () {
                            skypeConnector.hide(<SkypeLoaderMessage>{
                                message: '',
                                showLoader: false
                            });
                        }, function (error: any) {
                            console.log(CONFIG.ErrorPrefix.SkypeErrorPrefix + error);
                        });
                    }

                    conversation.selfParticipant.video.state.changed(
                        function (newState: string, reason: any, oldState: string) {
                            if (newState == 'Connected') {
                                var selfChannel = conversation.selfParticipant.video.channels(0);
                                selfChannel.stream.source.sink.format('Crop');
                                selfChannel.stream.source.sink.container.set(document.getElementById("selfVideo"));
                                conversation.selfParticipant.video.channels(0).isStarted.set(true);

                                skypeConnector.updateSkypeControls(<SkypeControls>{
                                    type: SkypeControlType.Video,
                                    enabled: true
                                });

                                console.log(CONFIG.ErrorPrefix.SkypeLog + "Video Service Started for " + conversation.selfParticipant.person.displayName());
                            }
                        });
                } else {
                    if (conversation.audioService.state() !== 'Connected') {
                        conversation.audioService.start().then(function () {
                            skypeConnector.hide(<SkypeLoaderMessage>{
                                message: '',
                                showLoader: false
                            });

                            skypeConnector.updateSkypeControls(<SkypeControls>{
                                type: SkypeControlType.Audio,
                                enabled: true
                            });
                            that.RenderParticipantVideos();
                            console.log(`${CONFIG.ErrorPrefix.SkypeLog} Audio Service Started for Patient`);
                        }, function (error: any) {
                            console.log(error);
                            skypeConnector.hide(<SkypeLoaderMessage>{
                                message: '',
                                showLoader: false
                            });
                        });
                    } else {
                        that.RenderParticipantVideos();
                    }
                }

                let countOfParticipantsAndSelf = conversation.participantsCount() + 1;
                skypeConnector.updateParticipantCount(countOfParticipantsAndSelf);

                let displayName = conversation.selfParticipant.person.displayName();
                let email = conversation.selfParticipant.person.email();
                let id = conversation.selfParticipant.person.id();
                let skypeMember = <SkypeMember>{
                    Id: id,
                    DisplayName: displayName,
                    Email: email,
                    Operation: SkypeMemberOperation.Add,
                    Status: SkypeMemberStatus.Active
                };
                /* Add the member to active chat members */
                skypeConnector.skypeMemberUpdate(skypeMember);
            }

            if (state === 'Disconnected' && oldState === 'Connected') {
                skypeConnector.show(<SkypeLoaderMessage>{
                    message: 'Looks like you have been disconnected from the conference. Please wait while we re-connect !',
                    showLoader: true
                });

                skypeConnector.updateSkypeControls(<SkypeControls>{
                    type: SkypeControlType.Conversation,
                    enabled: false
                });
            }

            if (state === 'Disconnected' && oldState !== 'Connected') {
                skypeConnector.updateSkypeControls(<SkypeControls>{
                    type: SkypeControlType.Conversation,
                    enabled: false
                });
            }
        });

        /* Other Participants */
        conversation.participants.added(function (skypeParticipant: any) {
            let name = skypeParticipant.person.displayName();
            console.log(`${CONFIG.ErrorPrefix.SkypeLog}Participant Added - ${name}`)

            skypeParticipant.state.changed(function (newStatus: string, reason: any, oldStatus: string) {
                let participantState = newStatus;
                console.log("Participant state: " + newStatus);
                if (newStatus == 'InLobby') {
                    if (userProfileService.IsDoctor()) {
                        skypeParticipant.person.id.get()
                            .then(function (id: any) {
                                let displayName = skypeParticipant.person.displayName();
                                let Id = id;
                                skypeConnector.skypeMemberUpdate(<SkypeMember>{
                                    Id: Id,
                                    DisplayName: displayName,
                                    Operation: SkypeMemberOperation.Add,
                                    Status: SkypeMemberStatus.InLobby
                                })
                            });
                    }
                }

                if (newStatus == 'Connected') {
                    let countOfParticipantsAndSelf = conversation.participantsCount() + 1;
                    that.skypeConnector.updateParticipantCount(countOfParticipantsAndSelf);

                    console.log(`${CONFIG.ErrorPrefix.SkypeLog}Participant Connected.`);
                    conversation.participants.each(function (participant: any) {
                        participant.person.id.get()
                            .then(function (id: any) {
                                let displayName = participant.person.displayName();
                                let Id = id;

                                console.log(`${CONFIG.ErrorPrefix.SkypeLog}Participant Connected Loop ${displayName}`);

                                if (participant.state() === newStatus) {
                                    skypeConnector.skypeMemberUpdate(<SkypeMember>{
                                        DisplayName: displayName,
                                        Id: Id,
                                        Operation: SkypeMemberOperation.Add,
                                        Status: SkypeMemberStatus.Active
                                    })
                                }

                                if (that.userProfileService.IsPatient()) {
                                    conversation.videoService.accept();
                                    if (conversation.videoService.videoMode() !== 'ActiveSpeaker') {
                                        console.log(`${CONFIG.ErrorPrefix.SkypeLog}Invoke Render Participant Videos`);
                                        that.RenderParticipantVideos();
                                    }
                                } else {
                                    if (conversation.videoService.videoMode() !== 'ActiveSpeaker') {
                                        console.log(`${CONFIG.ErrorPrefix.SkypeLog}Invoke Render Participant Videos`);
                                        that.RenderParticipantVideos();
                                    }
                                }
                            });
                    });
                }

                if (newStatus === 'Disconnected' && oldStatus == 'Connected') {
                    /* Lets handle re-rendering */
                    that.RenderParticipantVideos();
                }

                //TODO: Handle Disconnected Event
            });

            /* Non chrome based browser */
            if (conversation.videoService.videoMode() !== 'ActiveSpeaker') {
                skypeParticipant.video.state.when('Connected', function () {
                    // lets assign a container.
                    skypeParticipant.video.channels(0).isVideoOn.when(true, function () {
                        let displayName = skypeParticipant.person.displayName();
                        console.log(`${CONFIG.ErrorPrefix.SkypeLog}Video State Connected - ${displayName}`);

                        that.RenderParticipantVideos();
                    });

                    skypeParticipant.video.channels(0).isVideoOn.when(false, function () {
                        let displayName = skypeParticipant.person.displayName();
                        console.log(`${CONFIG.ErrorPrefix.SkypeLog}Video State Disconnected - ${displayName}`);

                        skypeParticipant.video.channels(0).stream.source.sink.container.set(null);

                        that.RenderParticipantVideos();
                    });
                });
                skypeParticipant.video.channels(0).isVideoOn.subscribe();
                skypeParticipant.video.state.subscribe();
            }

            /* Chrome based browser */
            if (conversation.videoService.videoMode() === 'ActiveSpeaker') {
                console.log(`${CONFIG.ErrorPrefix.SkypeLog}CHROME Active Speaker Mode`);
                // lets render the video if the currently speaking participant is not myself
                conversation.videoService.activeSpeaker.participant.changed(function (participant: any) {
                    if (participant !== conversation.selfParticipant) {
                        let channel = conversation.videoService.activeSpeaker.channel;

                        // add listener to turn video on/off
                        channel.isVideoOn.changed(function (isVideoOn: boolean) {
                            if (isVideoOn) {
                                console.log(`${CONFIG.ErrorPrefix.SkypeLog}Participant Video State On.`);

                                let activeParticpant = conversation.videoService.activeSpeaker.participant;
                                let participantName = '';
                                if (activeParticpant._value.person != null) {
                                    participantName = activeParticpant._value.person.displayName();
                                }

                                channel.stream.source.sink.format('Crop');
                                channel.stream.source.sink.container(document.getElementById("skypeVideo0"));
                                channel.isStarted.set(true).then(function () {
                                    console.log(`${CONFIG.ErrorPrefix.SkypeLog}Participant Video Rendering Started.`);
                                });
                            } else {
                                //TODO: Hide Patient Video
                                channel.isStarted.set(false);
                                console.log(`${CONFIG.ErrorPrefix.SkypeLog}Participant Video State False.`);
                            }
                        });
                    }
                });
            }
        });

        conversation.participants.removed(function (skypeParticipant: any) {
            console.log(CONFIG.ErrorPrefix.SkypeLog + "Self participant state - " + skypeParticipant.person.displayName());

            let countOfParticipantsAndSelf = conversation.participantsCount() + 1;
            that.skypeConnector.updateParticipantCount(countOfParticipantsAndSelf);

            let displayName = skypeParticipant.person.displayName();
            let Id = skypeParticipant.person.id();
            console.log(`${CONFIG.ErrorPrefix.SkypeLog}${displayName} - ${Id} Removed`);
            skypeConnector.skypeMemberUpdate(<SkypeMember>{
                Id: Id,
                DisplayName: displayName,
                Operation: SkypeMemberOperation.Remove,
                Status: SkypeMemberStatus.Offline
            });

            /* Lets re-render all participant videos */
            that.RenderParticipantVideos();
        });
    }

    private RenderParticipantVideos() {
        let that = <SkypeService>this;

        //Re-Render All
        that.skypeConnector.addRemoveSkypeVideo(<SkypeVideo>{
            Reset: true
        });

        if (this.conversation.videoService.videoMode() !== 'ActiveSpeaker') {
            let participantCount = this.conversation.participantsCount();

            let noOfMembersVideoOn = 0;
            if (participantCount > 0) {
                this.conversation.participants.each((participant: any) => {
                    let chn = participant.video.channels(0);
                    if (chn.isVideoOn()) {
                        noOfMembersVideoOn++;

                        let displayName = participant.person.displayName();
                        if (that.conversation.selfParticipant.person.id() == participant.person.displayName()) {
                            displayName = 'Me';
                        }
                        that.skypeConnector.addRemoveSkypeVideo(<SkypeVideo>{
                            DisplayName: displayName,
                            Id: participant.person.id()
                        });
                    }
                });
            }

            console.log(`${CONFIG.ErrorPrefix.SkypeLog}Participants - ${participantCount} , Video On - ${noOfMembersVideoOn}`);

            if (noOfMembersVideoOn > 0) {
                /* Create */
                setTimeout(() => that.StartParticipantVideos(noOfMembersVideoOn), 1500);
            }
        }
    }

    private StartParticipantVideos(noOfMembersVideoOn: number) {
        let video = 0;
        this.conversation.participants.each((participant: any) => {
            if (participant && participant.video) {
                let channel = participant.video.channels(0);

                if (channel && channel.isVideoOn()) {
                    if (window.navigator.userAgent.indexOf("Edge") == -1) {
                        channel.stream.source.sink.format('Crop');
                    }
                    if (noOfMembersVideoOn === 1) {
                        console.log(`${CONFIG.ErrorPrefix.SkypeLog}Starting Channel - skypeVideo`);
                        channel.stream.source.sink.container.set(document.getElementById("skypeVideo"));
                    } else {
                        let divId = 'skypeVideo' + video++;
                        console.log(`${CONFIG.ErrorPrefix.SkypeLog}Starting Channel - ${divId}`);
                        channel.stream.source.sink.container.set(document.getElementById(divId));
                    }
                    participant.video.channels(0).isStarted.set(true).then(function () {
                        console.log(`${CONFIG.ErrorPrefix.SkypeLog}Started Participant Video`)
                    });
                }
            }
        });
    }

    private parseSkypeMessages(message: any): Promise<any> {
        return new Promise((resolve, reject) => {
            let skypeMessage = new SkypeMessage();
            skypeMessage.Html = message.html();
            skypeMessage.TimeStamp = new Date(message.timestamp());
            if (message.sender) {
                skypeMessage.SenderName = message.sender.displayName();
                skypeMessage.SenderId = message.sender.id();
                if (message.sender.id() != this.client.personsAndGroupsManager.mePerson.id()) {
                    skypeMessage.SenderId = message.sender.id();
                } else {
                    skypeMessage.SenderName = "Me"
                }
                skypeMessage.UnRead = true;
                resolve(skypeMessage);
            } else {
                reject();
            }
        });
    }

    searchSkypeUsers(searchText: string): Promise<any> {
        return new Promise((resolve, reject) => {
            let personSearch = this.client.personsAndGroupsManager.createPersonSearchQuery();
            personSearch.text(searchText);
            personSearch.limit(50);
            personSearch.getMore().then((results: any) => {
                let persons = <Array<any>>results;
                let people = persons
                    .map(p => this.parsePeopleResults(p));

                resolve(people);
            }, (error: any) => {
                reject(error);
            });
        });
    }

    private parsePeopleResults(people: any) {
        if (people) {
            let person: SkypePeople = new SkypePeople();
            person.DisplayName = people.result.displayName();
            person.Department = people.result.department();
            person.Id = people.result.id();
            return person;
        }
        return;
    }

    SignIn() {
        if (!location.hash) {
            location.assign('https://login.windows.net/common/oauth2/authorize?response_type=token' +
                '&client_id=' + CONFIG.SkypeClientId +
                '&redirect_uri=' + location.href +
                '&resource=https://webdir.online.lync.com');
        }
    }

    admitUser(Id: string, displayName: string) {
        let that = this;
        let count = that.conversation.participantsCount();
        if (count) {
            for (let index = 0; index < count; index++) {
                let participant = that.conversation.participants(index);
                if (participant && participant.state._value === 'InLobby') {
                    participant.person.id.get().then((id: any) => {
                        let curPartId = id;
                        if (curPartId && curPartId == Id) {
                            participant.admit.enabled.get().then(function (isEnabled: any) {
                                participant.admit().then(() => {
                                    var countOfParticipantsAndSelf = that.conversation.participantsCount() + 1;
                                }, (error: any) => {
                                    that.toastrService.activate("Unable to admit patient to conversation.");
                                });

                                /* Update Participant count*/

                                /*
                                  Update member status
                                 */
                            });
                        }
                    });
                }
            }
        }
    }

    leaveConversation() {
        let that = <SkypeService>this;
        return new Promise((resolve, reject) => {
            let conversation = this.conversation;
            if (conversation) {
                conversation.selfParticipant.video.channels(0).isStarted.set(false);

                conversation.state.get().then((state: string) => {
                    if (state == 'Disconnected' || state === 'Disconnecting') {
                        this.toastrService.activate("You've left the online meeting.");
                        resolve();
                    } else {
                        conversation.leave().then(() => {
                            this.toastrService.activate("You've left the online meeting.");
                            that.signOut().then(function () {
                                console.log(`${CONFIG.ErrorPrefix.SkypeLog}Signout.`);
                            }, () => {
                                console.log(`${CONFIG.ErrorPrefix.SkypeErrorPrefix}Signout Error.`);
                            })
                            resolve();
                        }, (error: any) => {
                            reject();
                        });
                    }
                }, () => {
                    console.log(CONFIG.ErrorPrefix.SkypeErrorPrefix + "Error Getting conversation state");
                    reject(`CONFIG.ErrorPrefix.SkypeErrorPrefix + "Error Getting conversation state"`);
                });
            } else {
                console.log(`${CONFIG.ErrorPrefix.SkypeLog} active conversation does not exist.`)
                reject(`${CONFIG.ErrorPrefix.SkypeLog} active conversation does not exist.`);
            }
        });
    }

    sendMessage(message: any) {
        if (message) {
            if (this.chatServicePatient) {
                this.chatServicePatient.sendMessage(message, "Text").then(() => {
                    console.log(`${CONFIG.ErrorPrefix.SkypeLog}Message Sent`);
                }).catch((error: any) => {
                    console.log(`${error}`);
                });
            } else {
                //TODO: Start Chat Services
            }
        }
    }

    signOut(): Promise<any> {
        return this.client.signInManager.signOut();
    }

    StartSelfVideo() {
        let that = <SkypeService>this;
        this.conversation.selfParticipant.video.state.changed(function (newState: string, reason: any, oldState: string) {
            if (newState == 'Connected') {
                var selfChannel = that.conversation.selfParticipant.video.channels(0);
                selfChannel.stream.source.sink.format('Crop');
                selfChannel.stream.source.sink.container.set(document.getElementById("selfVideo"));
                that.conversation.selfParticipant.video.channels(0).isStarted.set(true).then(() => {
                    that.skypeConnector.updateSkypeControls(<SkypeControls>{
                        type: SkypeControlType.Video,
                        enabled: true
                    });
                }, (error: any) => {
                    console.log(`${CONFIG.ErrorPrefix.SkypeErrorPrefix}${error}`)
                });
            } else {
                console.log(`${CONFIG.ErrorPrefix.SkypeErrorPrefix} Conversation should be connected state to start video.`)
            }
        });
    }

    StopSelfVideo() {
        let that = <SkypeService>this;
        this.conversation.selfParticipant.video.channels(0).isStarted.set(false).then(function () {
            if (that.conversation.videoService.videoMode() !== "ActiveSpeaker") {
                that.conversation.selfParticipant.video.channels(0).stream.source.sink.container.set(null);
            }

            that.skypeConnector.updateSkypeControls(<SkypeControls>{
                type: SkypeControlType.Video,
                enabled: false
            });
        }, (error: any) => {
            console.log(`${CONFIG.ErrorPrefix.SkypeErrorPrefix}${error}`)
        });
    }

    audioMuteAndUnMute() {
        if (this.conversation) {
            let audio = this.conversation.selfParticipant.audio;
            let isMuted = !audio.isMuted();
            if (isMuted) {
                this.toastrService.activate("Your audio has been muted.");
                audio.isMuted.set(isMuted);
                this.skypeConnector.updateSkypeControls(<SkypeControls>{
                    type: SkypeControlType.Audio,
                    enabled: false
                });
            } else {
                audio.isMuted.set(isMuted);
                this.toastrService.activate("Your audio has been un-muted.");
                this.skypeConnector.updateSkypeControls(<SkypeControls>{
                    type: SkypeControlType.Audio,
                    enabled: true
                });
            }
        }
    }

    addParticipantToConversation(person: SkypePeople, meetingUri: string): Promise<any> {
        let that = <SkypeService>this;
        let personEmail = person.Id.split(':').length == 2 ? person.Id.split(':')[1] : person.Id;
        return new Promise((resolve, reject) => {
            this.addParticipantToCallAsync(personEmail, meetingUri).
                then(function (participant: any) {
                    if (participant) {
                        participant.state.changed(function (state: any) {
                            if (state === 'Connected') {
                                that.toastrService.activate(`${participant.displayName()} has joined the conversation.`);
                            }
                            console.log(`${CONFIG.ErrorPrefix.SkypeLog}Add Participant To Chat Status:${state}`);
                        });
                        resolve();
                    }
                    else {
                        reject();
                    }
                });
        });
    }

    private addParticipantToCallAsync(sipUri: string, meetingUri: string): Promise<any> {
        let that = <SkypeService>this;
        let convManager = this.conversation;
        return new Promise((resolve, reject) => {
            this.findPersonBySipAsync(sipUri).then(function (person: any) {
                if (that.conversation) {
                    let participant = that.conversation.createParticipant(person);
                    that.conversation.participants.add(participant).then((result: any) => {
                        console.log(`${CONFIG.ErrorPrefix.SkypeLog}Added Participant to Conversation.`);
                        console.log(`${CONFIG.ErrorPrefix.SkypeLog}Participant Count: ${that.conversation.participantsCount()}`);
                    });

                    that.conversation.audioService.start().then(function () {
                        console.log("Audio service started");
                    }, function (error: any) {
                        console.log(error);
                    });
                    resolve(participant);
                } else {
                    reject(`${CONFIG.ErrorPrefix.SkypeErrorPrefix}addParticipantToCallAsync Failed -> Conversation not available.`);
                }
            }, function (error: any) { reject(error) });
        });
    }

    findPersonBySipAsync(personUri: string): Promise<any> {
        return new Promise((resolve, reject) => {
            let personSearch = this.client.personsAndGroupsManager.createPersonSearchQuery();
            personSearch.text(personUri);
            personSearch.getMore()
                .then((results: any) => {
                    if (results && results[0]) {
                        console.log(`${CONFIG.ErrorPrefix.SkypeLog}Person found with Display name as  " + ${results[0].result.displayName()}`);
                        resolve(results[0].result)
                    }
                    reject(`${CONFIG.ErrorPrefix.SkypeErrorPrefix}No person found with uri ${personUri}`);
                }, (error: any) => {
                    reject(error);
                })
        });
    }

    saveConfiguration(cameraId: any, microphoneId: any, speakerId: any) {
        console.log("in skype service:saving confgiuration");
        let that = <SkypeService>this;
        that.client.devicesManager.cameras.subscribe();
        that.client.devicesManager.microphones.subscribe();
        that.client.devicesManager.speakers.subscribe();
        that.client.devicesManager.selectedMicrophone.changed(function (newMicrophone: any) {
            console.log("The selected microphone is now " + newMicrophone.name());
        });

        that.client.devicesManager.microphones.get().then(function (list: Array<any>) {
            for (var i = 0; i < list.length; i++) {
                var microphone = list[i];
                console.log(microphone.id());
                if (microphone.id() == microphoneId) {
                    that.client.devicesManager.selectedMicrophone.set(microphone).then(() => { console.log("changed microphone"); });
                    console.log("Microphone has changed to: " + microphone);
                }
            }
        });
        that.client.devicesManager.speakers.get().then(function (list: Array<any>) {
            for (var i = 0; i < list.length; i++) {
                var speaker = list[i];
                if (speaker.id() == speakerId) {
                    that.client.devicesManager.selectedSpeaker.set(speaker);
                    console.log("Speaker has changed to: " + speaker);
                }
            }
        });
        that.client.devicesManager.cameras.get().then(function (list: Array<any>) {
            for (var i = 0; i < list.length; i++) {
                var camera = list[i];
                if (camera.id() == cameraId) {
                    that.client.devicesManager.selectedCamera.set(camera);
                    console.log("camera has changed to: " + cameraId);
                }
            }
        });
    }

    getAvailableDevices(): Promise<any> {
        return new Promise((resolve, reject) => {
            let cameraList = new Array<SkypeDevices>();
            let microphoneList = new Array<SkypeDevices>();
            let speakerList = new Array<SkypeDevices>();
            let devicesList = { Cameras: new Array<SkypeDevices>(), Speakers: new Array<SkypeDevices>(), Microphones: new Array<SkypeDevices>() };

            let selectedCamera = this.client.devicesManager.selectedCamera() ? this.client.devicesManager.selectedCamera().id() : null
            let selectedMicrophone = this.client.devicesManager.selectedMicrophone() ? this.client.devicesManager.selectedMicrophone().id() : null
            let selectedSpeaker = this.client.devicesManager.selectedSpeaker().id() ? this.client.devicesManager.selectedSpeaker().id() : null

            this.client.devicesManager.cameras.added((device: any) => {
                let skypeDevice = <SkypeDevices>{ Id: device.id(), Name: device.name() }
                if (selectedCamera) {
                    skypeDevice.Selected = (skypeDevice.Id === selectedCamera);
                }
                cameraList.push(skypeDevice);
            });

            this.client.devicesManager.microphones.added((device: any) => {
                let skypeDevice = <SkypeDevices>{ Id: device.id(), Name: device.name() }
                if (selectedMicrophone) {
                    skypeDevice.Selected = (skypeDevice.Id === selectedMicrophone);
                }
                microphoneList.push(skypeDevice);
            });

            this.client.devicesManager.speakers.added((device: any) => {
                let skypeDevice = <SkypeDevices>{ Id: device.id(), Name: device.name() }
                if (selectedSpeaker) {
                    skypeDevice.Selected = (skypeDevice.Id === selectedSpeaker);
                }
                speakerList.push(<SkypeDevices>{ Id: device.id(), Name: device.name() });
            });

            this.client.devicesManager.microphones.removed((device: any) => {
                for (let i = 0; i < microphoneList.length; i++) {
                    if (microphoneList[i].Id == device.id()) {
                        microphoneList.splice(i, 1);
                    }
                }
            });

            this.client.devicesManager.cameras.removed((device: any) => {
                for (let i = 0; i < cameraList.length; i++) {
                    if (cameraList[i].Id == device.id()) {
                        cameraList.splice(i, 1);
                    }
                }
            });

            this.client.devicesManager.speakers.removed((device: any) => {
                for (let i = 0; i < speakerList.length; i++) {
                    if (speakerList[i].Id == device.id()) {
                        speakerList.splice(i, 1);
                    }
                }
            });

            devicesList.Cameras = cameraList;
            devicesList.Microphones = microphoneList;
            devicesList.Speakers = speakerList;

            resolve(devicesList);
        });
    }
}