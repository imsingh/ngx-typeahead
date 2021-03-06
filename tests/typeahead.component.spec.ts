import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { TypeaheadComponent } from '../src/typeahead.component';
import { Observable } from 'rxjs';
import { TypeaheadSuggestions } from '../src/typeahead.interface';

const KEY_UP = 'keyup';
const KEY_DOWN = 'keydown';
const ENTER = 'Enter';
const BACKSPACE = 'Backspace';

describe('TypeaheadComponent', () => {
  let
    fixture: ComponentFixture<TypeaheadComponent>,
    component: TypeaheadComponent;

  beforeEach(() => {
    jasmine.clock().uninstall();
    jasmine.clock().install();

    const module = TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [TypeaheadComponent]
    });

    fixture = module.createComponent(TypeaheadComponent);
    component = fixture.componentInstance;
  });

  it('should initialize component', () => {
    expect(fixture).toBeDefined('fixture should exist');
    fixture.detectChanges();
    expect(component instanceof TypeaheadComponent).toBeTruthy('Should be instance of TypeaheadComponent');
  });

  it('should copy suggestions to allmatches', fakeAsync(() => {
    const suggestions = ['ABC', 'DEF', 'GHI'];
    component.suggestions = suggestions;
    fixture.detectChanges();
    tick();
    expect(component.allMatches).toEqual(suggestions);
  }));

  it('should copy observable suggestions to allmatches', fakeAsync(() => {
    const suggestions: string[] = ['ABC', 'DEF', 'GHI'];
    const suggestions$: TypeaheadSuggestions = Observable.of(suggestions);
    component.suggestions = suggestions$;
    fixture.detectChanges();
    tick();
    expect(component.allMatches).toEqual(suggestions);
  }));

  it('should set simple value', fakeAsync(() => {
    const suggestions = ['ABC', 'DEF', 'GHI'];
    component.suggestions = suggestions;
    component.value = 'ABC';
    fixture.detectChanges();
    expect((<any> component)._input.value).toEqual('ABC');
  }));

  it('should set multiple values', fakeAsync(() => {
    const suggestions = ['ABC', 'DEF', 'GHI'];
    component.suggestions = suggestions;
    component.multi = true;
    component.value = ['ABC', 'DEF'];
    fixture.detectChanges();
    expect(component.values).toEqual(['ABC', 'DEF']);
    expect((<any> component)._input.value).toEqual('');
  }));

  it('should set complex value', fakeAsync(() => {
    const suggestions = [{ name: 'ABC', id: 'A' }, { name: 'DEF', id: 'D' }, { name: 'GHI', id: 'G' }];
    component.complex = true;
    component.suggestions = suggestions;
    component.value = 'A';
    fixture.detectChanges();
    expect((<any> component)._input.value).toEqual('ABC');
  }));

  it('should set multiple complex values', fakeAsync(() => {
    const suggestions = [{ name: 'ABC', id: 'A' }, { name: 'DEF', id: 'D' }, { name: 'GHI', id: 'G' }];
    component.suggestions = suggestions;
    component.complex = true;
    component.multi = true;
    fixture.detectChanges();
    tick();

    component.value = ['A', 'D'];
    fixture.detectChanges();
    expect(component.values).toEqual([{ name: 'ABC', id: 'A' }, { name: 'DEF', id: 'D' }]);
    expect((<any> component)._input.value).toEqual('');
  }));

  it('should show dropdown on input', fakeAsync(() => {
    const suggestions = ['ABC', 'DEF', 'GHI'];
    component.suggestions = suggestions;
    fixture.detectChanges();
    tick();

    const input = (<any> component)._input;
    expect(component.isExpanded).toBeFalsy();
    input.dispatchEvent(new KeyboardEvent(KEY_DOWN, { key: 'a' }));
    fixture.detectChanges();
    expect(component.isExpanded).toBeTruthy();
  }));

  it('should hide dropdown on escape', fakeAsync(() => {
    const suggestions = ['ABC', 'DEF', 'GHI'];
    component.suggestions = suggestions;
    fixture.detectChanges();
    tick();

    const input = (<any> component)._input;
    input.dispatchEvent(new KeyboardEvent(KEY_DOWN, { key: 'a' }));
    fixture.detectChanges();
    expect(component.isExpanded).toBeTruthy();
    input.dispatchEvent(new KeyboardEvent(KEY_DOWN, { key: 'Escape' }));
    fixture.detectChanges();
    expect(component.isExpanded).toBeFalsy();
  }));

  it('should limit the number of suggestions shown', fakeAsync(() => {
    const suggestions = ['batman', 'flash', 'aquaman', 'orin', 'robin', 'spectre'];
    component.suggestions = suggestions;
    component.settings.suggestionsLimit = 2;
    fixture.detectChanges();

    const input = (<any> component)._input;

    input.value = 'a';
    input.dispatchEvent(new KeyboardEvent(KEY_UP, { key: 'a' }));
    jasmine.clock().tick(50);
    fixture.detectChanges();

    const dropDownItems = fixture.nativeElement.querySelectorAll('.dropdown-menu .dropdown-item');

    expect(component.isExpanded).toBeTruthy();
    expect(dropDownItems.length).toBe(2);
  }));

  it('multi - should be able to enter new items with Enter key', fakeAsync(() => {
    const suggestions = ['batman', 'flash', 'aquaman', 'orin', 'robin', 'spectre'];
    component.suggestions = suggestions;
    component.multi = true;
    fixture.detectChanges();
    const customValue1 = 'hulk';
    const customValue2 = 'antman';

    const input = (<any> component)._input;

    // enter Hulk
    input.value = customValue1;
    input.dispatchEvent(new KeyboardEvent(KEY_UP, { key: ENTER }));
    jasmine.clock().tick(50);
    fixture.detectChanges();

    // Enter Antman
    input.value = customValue2;
    input.dispatchEvent(new KeyboardEvent(KEY_UP, { key: ENTER }));
    jasmine.clock().tick(50);
    fixture.detectChanges();

    const customItems = fixture.nativeElement.querySelectorAll('.typeahead-badge');
    expect(customItems[0].innerText).toContain(customValue1);
    expect(customItems[1].innerText).toContain(customValue2);
  }));

  it('multi - should delete item with Backspace key', fakeAsync(() => {
    const suggestions = ['batman', 'flash', 'aquaman', 'orin', 'robin', 'spectre'];
    component.suggestions = suggestions;
    component.multi = true;
    fixture.detectChanges();
    const customValue1 = 'hulk';

    const input = (<any> component)._input;

    // enter Hulk
    input.value = customValue1;
    input.dispatchEvent(new KeyboardEvent(KEY_UP, { key: ENTER }));
    jasmine.clock().tick(50);
    fixture.detectChanges();

    // delete with backspace
    input.dispatchEvent(new KeyboardEvent(KEY_DOWN, { key: BACKSPACE }));
    input.dispatchEvent(new KeyboardEvent(KEY_UP, { key: BACKSPACE }));
    jasmine.clock().tick(50);
    fixture.detectChanges();

    const customItems = fixture.nativeElement.querySelectorAll('.typeahead-badge');
    expect(customItems.length).toBe(0);
  }));

});
