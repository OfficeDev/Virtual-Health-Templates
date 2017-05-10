import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FabricToggle } from './fabric-toggle/fabric-toggle.component';
import { FabricBreadCrumbs } from './fabric-breadcrumbs/fabric-breadcrumbs.component';
import { FabricTextFilterModule } from './fabric-filter/fabric-filter.module';
import { SafePipe } from './pipes/safe-url.pipe';

import { PersonaImage } from './pipes/persona-image.pipe';

@NgModule({
    imports: [CommonModule, FabricTextFilterModule, FormsModule],
    exports: [CommonModule, FabricTextFilterModule, FabricToggle, FabricBreadCrumbs, SafePipe, PersonaImage],
    declarations: [FabricToggle, FabricBreadCrumbs, SafePipe, PersonaImage]
})
export class SharedModule { }

