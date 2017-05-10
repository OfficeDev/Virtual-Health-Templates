import { Component, OnInit, Input, Output, EventEmitter, ElementRef } from '@angular/core';
declare var fabric: any;
declare var $: any;

@Component({
    selector: 'fabric-toggle',
    templateUrl: './fabric-toggle.html'
})
export class FabricToggle implements OnInit {
    @Input() enabled: boolean = false;

    @Output()
    toggle: EventEmitter<boolean> = new EventEmitter();

    constructor(private el: ElementRef) {
    }


    ngOnInit() {
        if (this.el) {
            new fabric['Toggle'](this.el.nativeElement);
        }

    }

    changed() {
        setTimeout(() => {
            this.enabled = !this.enabled;
            this.toggle.emit(this.enabled);
        }, 500);
    }

}
