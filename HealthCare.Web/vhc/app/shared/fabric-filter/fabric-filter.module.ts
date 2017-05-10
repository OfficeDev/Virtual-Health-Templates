import { NgModule/*, ModuleWithProviders*/ } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { FabricFilterComponent } from './fabric-filter.component';

@NgModule({
  imports: [CommonModule, FormsModule],
  exports: [FabricFilterComponent],
  declarations: [FabricFilterComponent]
})
export class FabricTextFilterModule { }
