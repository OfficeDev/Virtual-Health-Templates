import { Component, OnInit } from '@angular/core';
import { Configuration } from './configuration.model';
import { ConfigurationService } from './configuration.service';
import { Breadcrumb } from '../shared/models/breadcrumb.model';
import { ToastService } from '../core/toast/toast.service';

@Component({
    selector: 'configuration',
    templateUrl: './configuration.component.html'
})
export class ConfigurationComponent implements OnInit {
    originalconfiguration: Configuration;
    configuration: Configuration;
    breadcrumbs: Array<Breadcrumb>;

    constructor(
        private configurationService: ConfigurationService,
        private toastrService: ToastService
    ) {
        this.configuration = new Configuration();
        this.breadcrumbs = [
            { linkName: 'Home', routerLink: '/dashboard' },
            { linkName: 'Configuration', routerLink: '/configuration' }
        ];
    }

    ngOnInit() {
        this.configurationService.getConfiguration()
            .subscribe(configuration => {
                this.configuration = <Configuration>configuration;
                this.originalconfiguration = Object.assign({}, this.configuration);
            });
    }

    updateToggle(value: any, key: string) {
        switch (key) {
            case 'private-browsing':
                this.configuration.MeetingOpenModeInBrowser = value;
                break;
            case 'wait-lobby':
                this.configuration.AllowLobby = value;
                break;
            case 'bandwidth-calculation':
                this.configuration.CalculateBandwidthDuringConference = value;
                break;
            case 'time-call':
                this.configuration.TimeOfJoiningCall = value;
                break;
            case 'peer-doctor-chat':
                this.configuration.AllowPeerChatControl = value;
                break;
            case 'trusted-api':
                this.configuration.AllowTrustedApiMeeting = value;
                break;
        }
    }

    get diagnostic() {
        return JSON.stringify(this.configuration);
    }

    discard() {
        this.configuration = Object.assign({}, this.originalconfiguration);
        this.toastrService.activate('Changes made to configuration have been discarded.');
    }

    save() {
        this.configurationService
            .saveConfiguation(this.configuration)
            .subscribe((response) => {
                if (response.ok) {
                    this.toastrService.activate('Application configs have been updated.');
                }

                this.ngOnInit();
            });

    }
}
