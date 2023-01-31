import {
  Component,
  DoCheck,
  ElementRef,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Self,
  ViewChild
} from '@angular/core';
import {NgControl, ControlValueAccessor, FormBuilder, FormControl, FormGroupDirective, NgForm} from '@angular/forms';
import {MatFormFieldControl} from '@angular/material/form-field';
import {map, Subject, Subscription, take} from 'rxjs';
import {FocusMonitor} from '@angular/cdk/a11y';
import {MatInput} from '@angular/material/input';
import {
  _AbstractConstructor,
  _Constructor,
  CanUpdateErrorState,
  ErrorStateMatcher,
  mixinErrorState
} from '@angular/material/core';
import {Search} from "../model";

export class CustomErrorMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl): boolean {
    return control.dirty && control.invalid;
  }

}

class SearchInputBase {
  constructor(public _parentFormGroup: FormGroupDirective,
              public _parentForm: NgForm,
              public _defaultErrorStateMatcher: ErrorStateMatcher,
              public ngControl: NgControl,
              public stateChanges: Subject<void>) {
  }
}

const _SearchInputMixinBase: _Constructor<CanUpdateErrorState> & _AbstractConstructor<CanUpdateErrorState> = mixinErrorState(SearchInputBase);

@Component({
  selector: 'app-search-form-field-control',
  templateUrl: './search-form-field-control.component.html',
  styleUrls: ['./search-form-field-control.component.scss'],
  providers: [
    {
      provide: MatFormFieldControl,
      useExisting: SearchFormFieldControlComponent
    },
    {
      provide: ErrorStateMatcher,
      useClass: CustomErrorMatcher
    }
  ]
})
export class SearchFormFieldControlComponent extends _SearchInputMixinBase
  implements OnInit, OnDestroy, DoCheck, MatFormFieldControl<Search>, ControlValueAccessor {
  private _subscription = new Subscription();
  private static nextId = 0;
  private _placeholder: string;
  stateChanges = new Subject<void>();

  @HostBinding()
  id = `search-control-id-${SearchFormFieldControlComponent.nextId++}`;

  @ViewChild(MatInput, {read: ElementRef, static: true}) private _matInput: ElementRef;

  @Input() set value(value: Search | null) {
    this.form.patchValue(value);
    this.stateChanges.next();
  }

  get value(): Search | null {
    return this.form.getRawValue();
  }

  @Input() set placeholder(value: string) {
    this._placeholder = value;
    this.stateChanges.next();
  }

  get placeholder(): string {
    return this._placeholder;
  }
  focused: boolean;

  get empty(): boolean {
    return !this.value.scope && !this.value.query;
  }

  @HostBinding('class.floated')
  get shouldLabelFloat(): boolean {
    return true;
  }

  @Input()
  required: boolean;
  @Input()
  disabled: boolean;
  controlType = 'search-form-field-control';
  autofilled?: boolean | undefined;

  @HostBinding('attr.aria-describedby')
  userAriaDescribedBy: string;

  onChange: (value: Search) => void;
  onTouch: () => void;

  readonly form = this.formBuilder.group({
    scope: new FormControl(),
    query: new FormControl()
  });

  constructor(private readonly focusMonitor: FocusMonitor,
              @Optional() @Self() public readonly ngControl: NgControl,
              private readonly formBuilder: FormBuilder,
              public _defaultErrorStateMatcher: ErrorStateMatcher,
              @Optional() _parentForm: NgForm,
              @Optional() _parentFormGroup: FormGroupDirective) {
    super(_defaultErrorStateMatcher, _parentForm, _parentFormGroup, ngControl);
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  writeValue(obj: Search): void {
    this.value = obj;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (isDisabled) {
      this.form.disable();
      this.stateChanges.next();
    }
  }

  setDescribedByIds(ids: string[]): void {
    this.userAriaDescribedBy = ids.join(' ');
  }

  onContainerClick(event: MouseEvent): void {
    this.focusMonitor.focusVia(this._matInput, 'program');
  }

  ngOnInit(): void {
    this.focusMonitor.monitor(this._matInput)
      .pipe(map(focused => !!focused))
      .subscribe(focused => {
        this.focused = focused;
        this.stateChanges.next();
      });

    this.focusMonitor.monitor(this._matInput)
      .pipe(take(1))
      .subscribe(() => this.onTouch());

    this._subscription.add(
      this.form.valueChanges.subscribe(({query, scope}) => this.onChange({query, scope}))
    );
  }

  ngDoCheck(): void {
    if (this.ngControl) {
      this.updateErrorState();
    }
  }

  ngOnDestroy(): void {
    this.focusMonitor.stopMonitoring(this._matInput);
    this.stateChanges.complete();
    this._subscription.unsubscribe();
  }

}
