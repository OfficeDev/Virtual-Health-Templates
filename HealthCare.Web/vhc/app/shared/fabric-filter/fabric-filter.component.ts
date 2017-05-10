import { Component, EventEmitter, Output, ElementRef, OnInit } from '@angular/core';
declare var fabric: any;

@Component({
    selector: 'fabric-filter',
    templateUrl: './fabric-filter.component.html'
})
export class FabricFilterComponent implements OnInit {
    @Output() changed: EventEmitter<string>;

    filter: string;

    constructor(private elem: ElementRef) {
        this.changed = new EventEmitter<string>();
    }

    clear() {
        this.filter = '';
        this.changed.emit(this.filter);
    }

    filterChanged(event: any) {
        event.preventDefault();
        this.changed.emit(this.filter);
    }

    ngOnInit() {
        if (this.elem) {
            let elements = this.elem.nativeElement.querySelectorAll('.ms-SearchBox');
            for (let element of elements) {
                new fabric['SearchBox'](element);
            }
        }
    }
}
