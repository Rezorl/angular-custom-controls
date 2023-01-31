import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SearchFormFieldControlComponent } from './search-form-field-control/search-form-field-control.component';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatDividerModule} from '@angular/material/divider';
import {ReactiveFormsModule} from '@angular/forms';

@NgModule({
  declarations: [
    SearchFormFieldControlComponent
  ],
  exports: [
    SearchFormFieldControlComponent
  ],
    imports: [
        CommonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDividerModule,
        ReactiveFormsModule
    ],
})
export class SearchModule {}
