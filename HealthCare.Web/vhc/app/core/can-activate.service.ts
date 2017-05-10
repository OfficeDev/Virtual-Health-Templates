import { Injectable } from '@angular/core';
import {
    CanActivate,
    Route,
    Router,
    ActivatedRouteSnapshot,
    RouterStateSnapshot
} from '@angular/router';

import { UserProfileService } from './user-profile.service';

@Injectable()
export class CanActivateAuthGuard implements CanActivate {
    constructor(private userProfileService: UserProfileService, private router: Router) { }

    canActivateChild(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this.canActivate(next, state);
    }

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if (this.userProfileService.IsDoctor) {
            return true;
        }
        return false;
    }
}
