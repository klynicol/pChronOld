import { Component, OnInit, ViewContainerRef, ViewChild, NgZone, Input } from "@angular/core";
import { Tracker } from 'meteor/tracker';
import { Meteor } from 'meteor/meteor';

//IMPORT CALL SERVER CLASS
import { CallServer } from '../../CallServer';

//CHILD COMPONENTS
import { ModalComponent } from '../modal/modal.component';

interface LoginCredentials {
  username: string;
  email: string;
  password: string;
}


@Component({
  selector: "signupModal",
  templateUrl: './signupModal.component.html',
  styleUrls: [ './signupModal.component.scss' ],
  providers: [CallServer]
})
export class SignupModalComponent {
  @ViewChild('modalComp') modalCompRef; //reference to Modal Component

  //new server object
  serverObject: CallServer;

  //init
  autorunComputation: Tracker.Computation;
  services: Array<any>;
  credentials: LoginCredentials;
  errors: Array<string>;
  isPasswordRecovery: boolean;
  isSignup: boolean;
  message: string;
  userPassConfirm: string;

  //form validation messages
  userNameMsg: string;
  passwordMsg: string;
  passwordMatchMsg: string;
  emailMsg: string;
 
  constructor(private zone: NgZone) {
    this._initAutorun();
    this.resetErrors();
    this.isPasswordRecovery = false;
    this.isSignup = false;

    //form validation messages
    this.userNameMsg ="";
    this.passwordMsg ="";
    this.passwordMatchMsg ="";
    this.emailMsg ="";

    this._resetCredentialsFields();

    this.serverObject = new CallServer;
  }

/*------START OF METHODS ------
-------------------------------
-------------------------------*/

  _initAutorun(): void {
    this.autorunComputation = Tracker.autorun(() => {
      this.zone.run(() => {
        //help updating the dom to display what's wrong
      this.userNameMsg = Session.get('userNameMsg');
      this.passwordMsg = Session.get('passwordMsg');
      this.passwordMatchMsg = Session.get('passwordMatchMsg');
      this.emailMsg = Session.get('emailMsg');
      })
    });
  }

  showModal(){
     this.modalCompRef.show();
   }
   

   //router feature. Need to look into this more in the future
  goBack(){
    //this.router.navigate(['/app']);
  }


  //GITHUB METHODS FROM ANGULAR2-METEOR-ACCOUNTS-UI
  _resetCredentialsFields() {
    this.credentials = { username: '', email: '', password: '' };
    this.userPassConfirm = "";
  }

  resetErrors() {
    this.errors = [];
    this.message = "";
  }

 
  recover() {
    this.resetErrors();
    Accounts.forgotPassword({ email: this.credentials.email }, (error) => {
      if (error) {
        this.errors.push(error.reason || "Unknown error");
      }
      else {
        this.message = "You will receive further instruction to your email address!";
        this._resetCredentialsFields();
      }
    });
  }


//this will need to be looked at because the checks are already being done.
  isFormValid(): boolean{
    if (!this.isUsernameValid()) return false;
    if (!this.isPasswordValid()) return false;
    if (!this.isEmailValid()) return false;
    if (!this.isPasswordMatching()) return false;
    return true;
  }

/*****************

INDIVIDUAL FORM VALIDATIONS

********************/
  isUsernameValid(): boolean{
    Session.set('userNameMsg', "");
    if(this.credentials.username.indexOf(' ') >= 0){
      Session.set('userNameMsg', "User Name Can't Contain Spaces. ");
      return false;
    }
    if(this.credentials.username.length > 19 ){
      Session.set('userNameMsg', "User Name is too Long. ");
      return false;
    }
    if(this.credentials.username.length < 4){
      Session.set('userNameMsg', "User Name Must Be 4 Characters Long.");
      return false;
    }
    return true;
  }

  isPasswordValid(): boolean{
    Session.set('passwordMsg', "");
    if(this.credentials.password.length < 5){
      Session.set('passwordMsg', "Password Must Be 5 Characters Long.");
      return false;
    }
    return true;
  }

  isEmailValid(): boolean{
    Session.set('emailMsg', "");
    let regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if(regex.test(this.credentials.email)){
       return true;
    }
    else{
      Session.set('emailMsg', "Email is not valid.");
      return false
    }
  }

  isPasswordMatching(): boolean{
    Session.set('passwordMatchMsg', "");
    if(this.credentials.password == this.userPassConfirm){
      return true;
    } else{
      Session.set('passwordMatchMsg', "Passwords must match.");
      return false;
    } 
  }



  signup(): void {
    if(this.isFormValid()){ //check the form for validation of all elements
      this.resetErrors();
      Meteor.call('checkUsername', this.credentials.username, (error, result) => {
        if (error) {
            this.errors.push(error.reason || "singupModal.signup error 1");
        }
        if(!result){
          Meteor.call('addUser', this.credentials, (error) => {  //create  new user
            if (error) {
              this.errors.push(error.reason || "singupModal.signup error 2");
            }
            else {
              Meteor.loginWithPassword(this.credentials.email, this.credentials.password, (error) => {
                if (error) {
                  this.errors.push(error.reason || "singupModal.signup error 3");
                }
              });
              this.modalCompRef.hide();
              this._resetCredentialsFields();
            }
          });
        }
        else Session.set('userNameMsg', "Username is already in use.");
      });
    } else console.log("form is not valid");
  }

  _hasPasswordService(): boolean {
    return !!Package['accounts-password'];
  }


/* WHAT DOES THIS PACKAGE DO???
  _getLoginServices(): Array<any> {
    let services = Package['accounts-oauth'] ? Accounts.oauth.serviceNames() : [];
    services.sort();

    if (this._hasPasswordService())
      services.push('password');

    return _.map(services, function(name) {
      return { name: name };
    });
  }
 
  dropdown(): boolean {
    return this._hasPasswordService() || this._getLoginServices().length > 1;
  }
  */

}



