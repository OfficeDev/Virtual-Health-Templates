import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'PersonaImage' })
export class PersonaImage implements PipeTransform {
    constructor() { }
    transform(name: string) {
        let title = name.split(' ');

        var chars = '';

        if (title.length > 1) {
            chars = (title[0].length > 0 ? title[0].charAt(0) : '') + (title[1].length > 0 ? title[1].charAt(0) : '');
        } else if (title.length == 1) {
            chars = (title[0].length > 0 ? title[0].charAt(0) : '');
        }

        return chars.toUpperCase();

    }
}
