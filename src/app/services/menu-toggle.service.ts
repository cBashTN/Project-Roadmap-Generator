import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { MenuComponent } from '../menu/menu.component';

@Injectable({
  providedIn: 'root'
})
export class MenuToggleService {

  constructor(private menuComponent: MenuComponent) {
  }

  private _toggleState = new Subject();
  public toggleState = this._toggleState.asObservable();
  private toggleVal = false;

  emitData() {
    //this.toggleVal = !this.toggleVal;

  //  this.toggleVal = this.menuComponent.isZoomOutToggleChecked;
    console.log('_______________');
   // console.log(this.menuComponent.isZoomOutToggleChecked);
    this._toggleState.next(this.toggleVal);
  }
}
