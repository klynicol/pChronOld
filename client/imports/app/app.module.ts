import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

//component
import { AppComponent } from "./app.component";
import { SignupModalComponent } from "./components/signupModal/signupModal.component";
import { PizzaSubmitComponent } from "./components/pizzaSubmit/pizzaSubmit.component";
import { ModalComponent } from "./components/modal/modal.component";
import { AdminPanelComponent } from "./components/adminPanel/adminPanel.component";
import { SearchModalComponent } from "./components/searchModal/searchModal.component";

@NgModule({
  // Components, Pipes, Directive
  declarations: [
    AppComponent,
    SignupModalComponent,
    PizzaSubmitComponent,
    ModalComponent,
    AdminPanelComponent,
    SearchModalComponent
  ],
  // Entry Components
  entryComponents: [
    AppComponent
  ],
  // Providers
  providers: [
  ],
  // Modules
  imports: [
    BrowserModule,
    FormsModule,
    /*
    RouterModule.forRoot([
        {path: 'signupModal', component:SignupModalComponent},
        {path: 'app', component:AppComponent},
        {path: 'pizzaSubmitModal', component:PizzaSubmitComponent}
    ]),*/
    CommonModule
  ],
  // Main Component
  bootstrap: [ 
    AppComponent
  ]
})
export class AppModule {
  constructor() {
  }
}
