import { Component } from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {Search} from "./component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  readonly form = new FormGroup<{search: FormControl<Search>}>({
    search: new FormControl<{scope: string, query: string}>({scope: '', query: null}, SearchValidator)
  });
}

function SearchValidator(control: FormControl) {
  return control.value.scope !== null && !!control.value.query ? null : {validateSearch: {invalid: true}};
}
