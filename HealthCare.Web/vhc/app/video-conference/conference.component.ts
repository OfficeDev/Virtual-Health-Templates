import { Component, OnInit, ElementRef, OnDestroy, NgZone, Input, Renderer2 } from '@angular/core';
import { ConferenceService } from './conference.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MeetingMetadata } from '../shared/models/meeting-metadata.model';
import { Peer } from '../shared/models/peer.model';
import { MeetingDetails } from '../shared/models/meeting-details.model';
import { Appointment } from '../shared/models/appointment.model';
import { SkypeService } from './skype.service';

import { MeetingService } from '../dashboard/meeting.service';
import { UserProfileService } from '../core/user-profile.service';
import { TrustedApiService, TrustedApiOptions } from '../video-conference/trustedapi.service';
import {
    SkypeUIConnector, SkypeLoaderMessage, SkypeMember, SkypeVideo, SkypeMessage,
    SkypeMemberOperation, SkypeMemberStatus, SkypeControls, SkypeControlType, SkypeDevices
} from './skype-ui-connector.service';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { ToastService } from '../core/toast/toast.service';
import { NgForm } from '@angular/forms';
import { SkypePeople } from '../shared/models/skype-people.model';
import { CONFIG } from '../core/config';
import { LoggerService } from '../core/logger.service';
import { SignalRUIConnector } from './signalr-ui-connector'

declare var fabric: any;
declare var $: any;

@Component({
    selector: "conference",
    templateUrl: './conference.component.html',
    styleUrls: ['./conference.component.css']
})

export class ConferenceComponent implements OnInit, OnDestroy {
    /* Template Style bindings */
    windowHeight: string;
    videoArea: string;
    videoSize: string;
    loaderPosition: string;
    isDoctor: boolean = false;
    videoEnabled: boolean = false;
    audioEnabled: boolean = true;
    ShowLeave: boolean = false;
    emailDialog: any;
    inviteEmail: string;
    invitedName: string;
    devicesDialog: any;
    hideConfiguration: boolean;
    participantEmail: string;
    chatMessage: string;
    appt: Appointment = new Appointment();

    encryptedData: string;
    meetingMetadata: MeetingMetadata;
    doctors: Array<Peer>;
    leaders: Array<Peer>;
    meetingDetails: MeetingDetails;
    activeMembers: Array<Peer> = [];
    skypeVideos: Array<SkypeVideo> = [];
    chatMessages: Array<SkypeMessage> = [];
    unreadMessages: number = 0;

    panel: any;
    activeDoctor: string;

    /* Video conference loader params*/
    showSkypeLoader: boolean = false;
    skypeLoaderMessage: string = 'Loading...';

    /* No of active members in conversation*/
    skypeParticipantCount: number = 0;

    personSearch: Array<SkypePeople>;

    /* Devices list */
    cameras: Array<SkypeDevices> = [];
    speakers: Array<SkypeDevices> = [];
    microphones: Array<SkypeDevices> = [];
    selectedCamera: any;
    selectedSpeaker: any;
    selectedMicrophone: any;
    showConfigureMessage: boolean = false;

    /* Subscription Events*/
    private skypeUIConnectorChanged: Subscription;
    private skypeParticipantsChanged: Subscription;
    private skypeConversationMembersChanged: Subscription;
    private skypeControlsChanged: Subscription;
    private skypeVideoChanged: Subscription;
    private SkypeMessageRecieved: Subscription;

    constructor(
        private conferenceService: ConferenceService,
        private meetingService: MeetingService,
        private route: ActivatedRoute,
        private skypeService: SkypeService,
        private elem: ElementRef,
        private userProfileService: UserProfileService,
        private skypeConnecter: SkypeUIConnector,
        private trustedApi: TrustedApiService,
        private toastService: ToastService,
        private router: Router,
        private renderer: Renderer2,
        private zone: NgZone,
        private loggerService: LoggerService) {

        this.configureListeners();
    }

    ngOnInit() {
        setInterval(this.recalculateBoardSizes(this), 10000);

        this.route.params.subscribe(params => {
            this.encryptedData = params['meetingUri'];

            this.conferenceService
                .getMeetingMetadata(this.encryptedData)
                .subscribe((meeting) => {
                    this.meetingMetadata = meeting;
                    this.userProfileService.UserType =
                        this.meetingMetadata.UserType;
                    this.isDoctor = this.userProfileService.IsDoctor();

                    if (this.meetingMetadata) {
                        this.conferenceService
                            .checkTimeOfJoining(this.meetingMetadata.ItemId)
                            .subscribe((allow) => {
                                /* If Meeting is available then load meeting details */
                                if (allow) {
                                    this.loadScreenComponents();
                                } else {
                                    //TODO: Meeting Expired -> Take User to error screen
                                }
                            }, (error) => console.log(error));
                    }
                }, (error) => {
                    console.log(error);
                });
        });
    }

    private loadScreenComponents() {
        this.conferenceService
            .getDoctors()
            .subscribe((doctors) => {
                this.doctors = doctors;
            });

        if (this.isDoctor) {
            this.conferenceService
                .getLeaders()
                .subscribe((leaders) => {
                    this.leaders = leaders;
                });
            this.leaders = [];
        }


        if (this.meetingMetadata.ItemId) {
            let meetingId = +this.meetingMetadata.ItemId;
            this.conferenceService
                .getMeetingDetails(meetingId)
                .subscribe((details) => {
                    this.meetingDetails = details;
                    this.activateFabricUi();

                    if (this.meetingMetadata.IsPatient) {
                        this.trustedApi
                            .requestAnonymousToken(location.origin, this.meetingDetails.OnlineMeetingUrl)
                            .subscribe((options) => {
                                if (options == null) {
                                    this.toastService.activate('Sorry, we are unable to create a guest login.');
                                }
                                let opt = new TrustedApiOptions(
                                    options.Token,
                                    options.DiscoverUri,
                                    options.TenantEndpointId,
                                    options.DisplayName);
                                this.skypeService.InitSkype(this.meetingDetails.OnlineMeetingUri, opt.Options);
                            }, (error) => {
                                this.toastService.activate('Sorry, we are unable to create a guest login.');
                            });
                    } else {
                        this.skypeService.InitSkype(this.meetingDetails.OnlineMeetingUri);
                    }
                });
        }
    }

    openChat(leader: Peer) {
        if (leader == null) {
            return;
        }

        if (this.panel) {
            let fabricPanel = new fabric['Panel'](this.panel);
        }

        this.activeDoctor = leader.Title;
    }

    admitUser(peer: Peer) {
        if (peer) {
            if (peer.Status == SkypeMemberStatus.InLobby) {
                this.skypeService.admitUser(peer.Id, peer.Title);
            }
        }
    }

    hangup() {
        this.skypeService.leaveConversation().then(() => {
            if (this.isDoctor) {
                this.router.navigate(['/dashboard']);
            } else {
                this.router.navigate(['/thank-you']);
            }
        });
    }

    openCommonChat() {
        this.activeDoctor = 'Doctor';
        this.chatMessage = '';


        /* Mark messages as read */
        this.zone.run(() => {
            for (let message of this.chatMessages) {
                message.UnRead = false;
            }
            this.unreadMessages = 0;
        });


        if (this.panel) {
            let fabricPanel = new fabric['Panel'](this.panel);
        }
    }

    postMessage() {
        if (this.chatMessage.length > 0) {
            this.skypeService.sendMessage(this.chatMessage);
            this.chatMessage = '';
        }
    }

    startStopVideo() {
        if (this.videoEnabled) {
            this.skypeService.StopSelfVideo();
        } else {
            this.skypeService.StartSelfVideo();
        }
    }

    muteAndUnMuteAudio() {
        this.skypeService.audioMuteAndUnMute();
    }

    activateFabricUi() {
        let that = this;
        let emailDialog = document.querySelector("#emailInviteDialog");
        let devicesDialog = document.querySelector("#configurationDialog");

        setTimeout(() => {
            that.panel = this.elem.nativeElement.querySelector('.ms-Panel');
            that.emailDialog = new fabric['Dialog'](emailDialog);
            that.devicesDialog = new fabric['Dialog'](devicesDialog);
        }, 200);
    }

    private configureListeners() {
        let that = this;
        this.skypeUIConnectorChanged = this.skypeConnecter.skypeLoader
            .subscribe((skypeLoaderMessage) => this.subscribeLoaderChanges(skypeLoaderMessage, that));

        this.skypeParticipantsChanged = this.skypeConnecter.skypeParticipants
            .subscribe((count) => this.subscribeParticipantChanges(count, that));

        this.skypeConversationMembersChanged = this.skypeConnecter.skypeMembers
            .subscribe((skypeMember: SkypeMember) => this.subscribeSkypeMemberChanged(skypeMember, that));

        this.skypeControlsChanged = this.skypeConnecter.skypeControls
            .subscribe((skypeControls: SkypeControls) => this.subscribeSkypeControlsChanged(skypeControls, that));


        this.skypeVideoChanged = this.skypeConnecter.skypeVideo
            .subscribe((skypeVideo: SkypeVideo) => this.subscribeSkypeVideoChanged(skypeVideo, that));

        this.SkypeMessageRecieved = this.skypeConnecter.skypeMessages
            .subscribe((skypeMessage: SkypeMessage) => this.subscribeSkypeMessages(skypeMessage, that));

    }

    subscribeLoaderChanges(skypeLoaderMessage: SkypeLoaderMessage, that: any) {
        that.zone.run(() => {
            this.showSkypeLoader = skypeLoaderMessage.showLoader;
            this.skypeLoaderMessage = skypeLoaderMessage.message;
        });
    }

    subscribeParticipantChanges(participant: number, that: any) {
        that.zone.run(() => this.skypeParticipantCount = participant);
    }

    subscribeSkypeMemberChanged(skypeMember: SkypeMember, that: any) {
        let present = false;
        let peer = <Peer>{ Email: skypeMember.Email, Title: skypeMember.DisplayName, Status: skypeMember.Status, Id: skypeMember.Id };
        switch (skypeMember.Operation) {
            case SkypeMemberOperation.Add:
                for (let member of this.activeMembers) {
                    if (member.Id && peer.Id) {
                        if (member.Id.toLowerCase() === peer.Id.toLowerCase()) {
                            present = true;
                            if (member.Status === SkypeMemberStatus.InLobby) {
                                that.zone.run(() => {
                                    member.Status = SkypeMemberStatus.Active;
                                    console.log('Admiting peer: ' + peer.Title);
                                });
                            }
                            break;
                        }
                    }
                }
                if (!present) {
                    that.zone.run(() => {
                        console.log(`${CONFIG.ErrorPrefix.SkypeLog}Adding Member : ${peer.Title}`);;
                        this.activeMembers.push(peer)
                    });

                }
                break;
            case SkypeMemberOperation.Remove:
                let index: number;
                for (let member of this.activeMembers) {
                    if (member.Id) {
                        if (member.Id.toLowerCase() === peer.Id.toLowerCase()) {
                            present = true;
                            index = this.activeMembers.indexOf(member);
                            break;
                        }

                    }
                }
                if (present) {
                    that.zone.run(() => {
                        console.log(`${CONFIG.ErrorPrefix.SkypeLog}Removing Member : ${peer.Title}`);;
                        this.toastService.activate(`${peer.Title} has left the meeting.`);
                        this.activeMembers.splice(index, 1);
                    });

                }
                break;
        }
    }

    subscribeSkypeControlsChanged(skypeControls: SkypeControls, that: any) {
        that.zone.run(() => {
            if (skypeControls) {
                switch (skypeControls.type) {
                    case SkypeControlType.Audio:
                        this.audioEnabled = skypeControls.enabled;
                        break;
                    case SkypeControlType.Video:
                        this.videoEnabled = skypeControls.enabled;
                        break;
                    case SkypeControlType.Conversation:
                        this.ShowLeave = skypeControls.enabled;
                        break;
                }
            }
        });
    }

    subscribeSkypeVideoChanged(skypeVideo: SkypeVideo, that: any) {
        that.zone.run(() => {
            if (skypeVideo.Reset) {
                this.skypeVideos = [];
                return;
            }
            let present = false;
            for (let video of this.skypeVideos) {
                if (video.Id === skypeVideo.Id) {
                    console.log(`Video Id: ${video.Id}, To Check: ${skypeVideo.Id}`);
                    present = true;
                    break;
                }
            }

            if (!present) {
                this.skypeVideos.push(skypeVideo);
                console.log(`${CONFIG.ErrorPrefix.SkypeLog}Adding Video,  Video Length ${this.skypeVideos.length}`);
            }
        });
    }

    subscribeSkypeMessages(skypeMessage: SkypeMessage, that: any) {
        that.zone.run(() => {
            this.chatMessages.push(skypeMessage);

            /* UnRead Messages */
            this.unreadMessages = 0;
            for (let message of this.chatMessages) {
                if (message.UnRead && message.SenderName.toLocaleLowerCase() !== 'me') {
                    this.unreadMessages++;
                }
            }
        });
    }

    ngOnDestroy() {
        this.skypeUIConnectorChanged.unsubscribe();
        this.skypeParticipantsChanged.unsubscribe();
        this.skypeConversationMembersChanged.unsubscribe();
        this.skypeControlsChanged.unsubscribe();
        this.skypeVideoChanged.unsubscribe();
        this.SkypeMessageRecieved.unsubscribe();
    }

    openEmailInviteDialog() {
        this.personSearch = [];
        this.inviteEmail = '';
        this.emailDialog.open();
    }

    openDevicesDialog() {
        this.hideConfiguration = true;
        this.showConfigureMessage = true;
        this.cameras = [];
        this.microphones = [];
        this.speakers = [];
        this.skypeService.getAvailableDevices()
            .then((devices: any) => {
                if (devices.Cameras) {
                    this.cameras = devices.Cameras;

                    for (var device of this.cameras) {
                        if (device.Selected) {
                            this.selectedCamera = device.Id;
                        }
                    }
                }

                if (devices.Microphones) {
                    this.microphones = devices.Microphones;

                    for (var device of this.microphones) {
                        if (device.Selected) {
                            this.selectedMicrophone = device.Id;
                        }
                    }

                }

                if (devices.Speakers) {
                    this.speakers = devices.Speakers;

                    for (var device of this.speakers) {
                        if (device.Selected) {
                            this.selectedSpeaker = device.Id;
                        }
                    }
                }
                this.hideConfiguration = false;
            }, (error: any) => {
                console.log(error);
            });

        this.devicesDialog.open();
    }

    closeDevicesDialog() {
        this.devicesDialog.close();
    }

    searchParticipants() {
        this.personSearch = [];
        this.skypeService
            .searchSkypeUsers(this.participantEmail)
            .then((result: any) => {
                this.personSearch = result;
            }, (error) => {

            });
    }

    sendEmailInvite(form: NgForm) {
        if (this.appt) {
            this.appt.ItemId = +this.meetingMetadata.ItemId;
            this.meetingService
                .sendInvite(this.appt)
                .subscribe((resp: any) => {
                    let success = <boolean>resp;

                    if (success) {
                        form.resetForm();
                        this.toastService.activate('Email Invite has been sent.');
                    } else {
                        this.toastService.activate('Unable to send email invite!!');
                    }
                }, (error: any) => {
                    this.toastService.activate('Unable to send email invite!!');
                });
        }

        this.emailDialog.close();
    }

    cancelSendEmailInvite() {
        this.appt = new Appointment();
        this.emailDialog.close();
    }

    recalculateBoardSizes(that: any) {
        that.zone.run(() => {
            this.windowHeight = ($(window).height() - 55) + 'px';
            this.loaderPosition = ($(window).height() - 155) / 2 + 'px';
            this.videoArea = (($(window).height() - 55 - 40) + 'px');
            this.videoSize = (($(window).height() - 55 - 40) / 2 + 'px');
        });
        console.log(`${CONFIG.ErrorPrefix.SkypeLog}Recalculated Board Sizes`);
    }

    saveConfiguration() {
        this.skypeService.saveConfiguration(this.selectedCamera, this.selectedMicrophone, this.selectedSpeaker);
        this.devicesDialog.close();
    }
}