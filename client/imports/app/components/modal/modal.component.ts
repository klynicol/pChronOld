import { Component, OnInit, ViewContainerRef } from "@angular/core";

@Component({
  selector: "modal",
  templateUrl: './modal.component.html',
  styleUrls: [ './modal.component.scss' ]
})


/*---CODE TAKEN FROM THIS PLUNKER--------------------------
---https://plnkr.co/edit/U8gRRF9S2qZfzGUasFEK?p=preview---*/



export class ModalComponent {
  //modal variables
  public visible = false;
  private visibleAnimate = false;

  //router back to the app component
  //private router: Router;
  constructor() {
  }

  //MODAL FUNCTIONS
  public show(): void {
    this.visible = true;
    setTimeout(() => this.visibleAnimate = true, 100);
  }

  public hide(): void {
    this.visibleAnimate = false;
    setTimeout(() => this.visible = false, 300);
  }

  public onContainerClicked(event: MouseEvent): void {
    if ((<HTMLElement>event.target).classList.contains('modal')) {
      this.hide();
    }
  }

}

interface UserInfo{
}