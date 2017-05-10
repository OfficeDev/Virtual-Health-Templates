import { Injectable, Optional, SkipSelf } from '@angular/core';


@Injectable()
export class UserProfileService {
    private userType: string;


    constructor( @Optional() @SkipSelf() prior: UserProfileService) {
        if (prior) { return prior; }
    }

    public get UserType() {
        return this.userType;
    }

    public set UserType(value) {
        this.userType = value;
    }

    public IsDoctor(): boolean {
        if (this.userType === null || this.userType === '') {
            throw new Error("User Type is not set !!");
        }
        return this.userType === 'Doctor';
    }

    public IsPatient(): boolean {
        if (this.userType === null || this.userType === '') {
            throw new Error("User Type is not set !!");
        }
        return this.userType === 'Patient';
    }
}
