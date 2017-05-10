import { Component, Input, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Breadcrumb } from '../models/breadcrumb.model';
declare var fabric: any;

@Component({
    selector: 'fabric-breadcrumbs',
    templateUrl: './fabric-breadcrumbs.html'
})

export class FabricBreadCrumbs {
    @Input() breadcrumbs: Array<Breadcrumb>;

    constructor(private el: ElementRef, private router: Router) {
        this.breadcrumbs = [];
    }

    navigateTo(link: Breadcrumb) {
        this.router.navigate([link.routerLink]);
    }
}
