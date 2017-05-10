import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigurationService } from './configuration.service';
import { ConfigurationRoutingModule, routedComponents } from './configuration-routing.module';
import { SharedModule } from '../shared/shared.module';
import { FormsModule } from '@angular/forms';
//import { FabricBreadCrumbs } from '../shared/fabric-breadcrumbs/fabric-breadcrumbs.component';
//import { FabricBreadCrumbs } from '../shared/fabric-breadcrumbs/fabric-breadcrumbs.component';


@NgModule({
    imports: [ConfigurationRoutingModule, SharedModule, FormsModule, CommonModule],
    declarations: [routedComponents],
    providers: [ConfigurationService] 
})
export class ConfigurationModule { }