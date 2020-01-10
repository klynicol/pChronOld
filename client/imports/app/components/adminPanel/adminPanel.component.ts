import { Component, ViewChild, NgZone, Input, ChangeDetectorRef } from "@angular/core";
import { Mongo } from 'meteor/mongo'
import { MeteorObservable } from 'meteor-rxjs';
import { Session } from 'meteor/session';

//THIS COMPONENT
//import template from "./adminPanel.component.html";
//import style from "./adminPanel.component.scss";

//CHILD COMPONENTS
import { ModalComponent } from '../modal/modal.component';

//IMPORT CALL SERVER CLASS
import { CallServer } from '../../CallServer';



//observable
import { Observable } from 'rxjs/Observable';


@Component({
  selector: "adminModal",
  templateUrl: './adminPanel.component.html',
  styleUrls: [ './adminPanel.component.scss' ]
})

export class AdminPanelComponent {
  //Inputs from main component
  @Input() isLoggingIn;
  @Input() isLoggedIn;
  @Input() currentUser;
  @Input() isAdmin;
  @Input() newPizzas;

	@ViewChild('modalComp') modalCompRef; //reference to the Modal Component

  //new server object
  serverObject: CallServer;
  

  autorunComputation: Tracker.Computation;

  //TODO find a type that can be used for these username I.E. Observable<User[]>
  userNames: any[]; //display all the users


	errors: Array<string>;
	message: string;

  searchString: string;
  userInQuestion: Meteor.User;
  usersPublished: boolean;

  //searchString subscriptions
  searchStringSub: any;

	constructor(private zone: NgZone){
    this._resetErrors();
    this._initAutorun();
    this.serverObject = new CallServer;
   
    Meteor.subscribe('allUsers');
    Session.setDefault('userInQuestion', Meteor.user());
	}

    /*------INIT ----------------
  -------------------------------
  -------------------------------*/

  _initAutorun(): void {
    this.autorunComputation = Tracker.autorun(() => {
      this.zone.run(() => {
        this.userNames = Meteor.users.find({}, {sort: {createdAt: 1}}).fetch();
        //reactive searchString, helping update the DOM
        this.userInQuestion = Session.get('userInQuestion');
      });
    });
  }

  _resetErrors() {
      this.errors = [];
      this.message = "";
    }

  showModal(){
   this.modalCompRef.show()
 }


	/*------START OF METHODS ------
	-------------------------------
	-------------------------------*/

  findUser(detailsButton){
    if(this.isAdmin && this.isLoggedIn){
      if(detailsButton) this.searchString = detailsButton;
      Meteor.call('findUser', this.searchString, (error, result) => {
        if(error){
          this.errors.push(error + error.reason || "|error|");
        }
        if(result){
          Session.set('userInQuestion', result);
          //Meteor.subscribe('userDetails');
          //Session.set('userInQuestion', Meteor.users.findOne({username: this.searchString}));
        } 
      });
    }
    else console.log("You are not admin or Users are not yet published.");
  }

  deleteUser(user): void{
    if(this.isAdmin && confirm("Are you sure you want to delete user: " + user + "?")){
     Meteor.call('deleteUser', user, (error, result) => {  //call to the server to delete a user
        if (error) {
          this.errors.push(error.reason || "Unknown error");
        }
        if(result){
          console.log(result);
        }
      });
    }
  }
    makeAdmin(user): void{
    if(this.isAdmin && confirm("Are you sure you want to delete user: " + user + "?")){
     Meteor.call('deleteUser', user, (error, result) => {  //call to the server to delete a user
        if (error) {
          this.errors.push(error.reason || "Unknown error");
        }
        if(result){
          console.log(result);
        }
      });
    }
  }

  private viewPizza(id: string){
    Session.set('viewDetailsId', id );
  }
  	
}
