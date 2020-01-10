import { Component, OnInit, ViewChild, NgZone, ElementRef } from "@angular/core";
import { Observable } from 'rxjs/Observable';
import { MeteorObservable } from 'meteor-rxjs';
import { Tracker } from 'meteor/tracker';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';

//CHILD COMPONENTS
import { SignupModalComponent } from './components/signupModal/signupModal.component';
import { PizzaSubmitComponent } from './components/pizzaSubmit/pizzaSubmit.component';
import { ModalComponent } from './components/modal/modal.component';

//PIZZA & SERVER DATABASES
import { Pizzas } from '../../../both/collections/gaunt.collection';
import { PizzaModel } from '../../../both/models/gaunt.model';

//IMPORT CALL SERVER CLASS
import { CallServer } from './CallServer';

/********************
----ERROR 802---------
*********************/

interface LoginCredentials {
  email: string;
  password: string;
}

@Component({
  selector: "app",
  templateUrl: './app.component.html',
  styleUrls: [ './appcss/app.component.scss', './appcss/appheader.scss', './appcss/appbody.scss', './appcss/appfooter.scss']
})

export class AppComponent implements AfterViewInit {
  //init
  errors: Array<string>;
  message: string;
  autorunComputation: Tracker.Computation;

  //User Variables
  credentials: LoginCredentials;
  currentUser: Meteor.User;
  isAdmin: boolean;
  isLoggingIn: boolean;
  isLoggedIn: boolean;

  viewSignup: boolean; //signup modal toggle
  searchType: string;  //search selector
  currentPizza: any; //currentPizza being viewed
  serverObj: CallServer;  //server class object
  adminSelectUpdate: string = ""; //holds a call to the server to update a pizza

  /*--- HTML ELEMENT SELECTORS----*/
  chatColors: [{ user: string, color: string}];
  votedThumbUpImg: string = "/pictures/VotedThumbsUp.png";
  thumbUpImg: string = "/pictures/ThumbsUp.png";
  votedThumbDownImg: string = "/pictures/VotedThumbsDown.png";
  thumbDownImg: string = "/pictures/ThumbsDown.png";
  castUpvoteImg: string = "greenThumbLight";
  castDownvoteImg: string = "orangeThumbLight";
  styleImg: string;
  typeImg: string;

  //pizza database
  private pizzas: Observable<PizzaModel[]>;
  public newPizzas: PizzaModel[] = []; //pizzas that need to be reviewed by admin
  newPizzaPushFinished: boolean = false;

  //testing some code, This is how elements are gonna be refered to for the modular system
  //@ViewChild("testButton", {read: ElementRef}) testButton:ElementRef;

  constructor(private zone: NgZone) {
    /*--- INIT----*/
    this._initAutorun();
    this._resetErrors();
    this._resetCredentialsFields();
    this.isAdmin = false;
    this.viewSignup = false;
    this.searchType = "general"; //general search is default
    this.currentPizza = {};
    this.serverObj = new CallServer; //Call Server class
    this.checkAdmin(); //check admin and set last login when page is refreshed

    /*--- HTML ELEMENT SELETORS----*/
    this.chatColors = [{user: "", color: ""}];

    /*--- SUBSCRIBE TO THE PIZZAS----*/
    MeteorObservable.subscribe('pizzas').subscribe();

    /*---Subscribe to the newPizza submits---*/
    let tempPizzaList = Pizzas.find({reviewedByAdmin: false}); //pizzas that need to be reviewed by admin
    let serverSub = tempPizzaList.subscribe(
      value => this.newPizzas = value,
      error => this.errors.push(error.reason + " |error802-1|"),
      () => this.newPizzaPushFinished = true
    );

    /*--- SESSION VARIABLES----*/
    Session.setDefault('isAdmin', false); //not sure if this is needed to init session variable
    Session.setDefault('currentPizza', null);

    /*--- LOG ANY ERRORS THAT HAPPEND IN THE CONSTRUCTOR----*/
    this.logErrors();
  }

  //testing some code, This is how elements are gonna be refered to for the modular (movable) system
  /*
  ngAfterViewInit(): void {
        this.testButton.nativeElement.onclick = () => alert("It's clicked");
  }
  */

  /*---------------INIT -----------
  ---------------------------------
  -------------------------------*/

  private _initAutorun(): void {
    this.autorunComputation = Tracker.autorun(() => {
      this.zone.run(() => {
        this.pizzas = Pizzas.find({}, {sort: {votes: -1}, limit: 10}).zone();
        this.currentUser = Meteor.user();  //update the current user automatically
        this.isLoggingIn = Meteor.loggingIn();
        this.isLoggedIn = !!Meteor.user();

        //help updating the DOM!
        this.isAdmin = Session.get('isAdmin');
        this.currentPizza = Pizzas.findOne({_id: Session.get('viewDetailsId')});
      });
    });
  }

  private _resetErrors() {
    this.errors = [];
    this.message = "";
  }

  private _resetCredentialsFields() {
    this.credentials = { email: '', password: '' };
  }

    /*------START OF METHODS ------
  -------------------------------
  -------------------------------*/

  private login(): void {
    if(this.credentials.email && this.credentials.password){
      this._resetErrors();
      let email: string = this.credentials.email;
      let password: string = this.credentials.password;
      Meteor.loginWithPassword(email, password, (error) => {
        if (error) {
          this.errors.push(error.reason || "Unknown error");
        }
        else {
          //this.isDropdownOpen = false;
          this._resetCredentialsFields();
          Tracker.flush();
        }
      });
     this.checkAdmin();
     this._resetCredentialsFields();
     }
     this.logErrors();
  }

  private logout(): void {
    Meteor.logout();
    Session.set('isAdmin', false); //setting back to false to prevent non-admins
  }

  private checkAdmin(): void{
      console.log("check admin called");
      Meteor.call('checkAdmin', (error, result) => { //check admin
        if (error) {
          this.errors.push(error.reason || "checkAdmin call from server has an error");
        }
        Session.set('isAdmin', result);
      });
      //update last login date
      Meteor.call('lastLogin', (error) => {
        if (error) {
          this.errors.push(error.reason || "||new error");
        }
      });
      this.logErrors();
  }


  private displayName(): string {
    let user : any = this.currentUser;
    if (!user)
      return '';
    if (user.profile && user.profile.name){
      return user.profile.name;
     }
    if (user.username){
      return user.username;
    }
    if (user.emails[0]){
      return user.emails[0].address;
    }
    return '';
  }

 
  private handleChat(input: string): void{
    if(this.isLoggedIn){
      this.serverObj.chatInput(input, this.isAdmin);
    } else alert("Please login or signup");
  }

  private displayThumbUp(pizzaId): string{
    if(this.currentUser){
      let voteList = this.currentUser.upVotes;

      //prototype function faster???
      let myfe = () => {
        var tr = false;
        voteList.forEach((e) => {if(e === pizzaId)tr = true;})
        return tr;
      }
      /*
      //this function is slower.. using for loops
      let tempBool = () => {
          for(let i = 0; i < voteList.length; i++){
            if(voteList[i] == pizzaId) return true;
          }
          return false; //if none are found in the array
      };
      */
      if(myfe()){
        return this.votedThumbUpImg;
      } else return this.thumbUpImg;
    }
    else return this.thumbUpImg;
  }

  private displayThumbDown(pizzaId: string): string{
    if(this.currentUser){
      //holds the user downvote list
      let voteList = this.currentUser.downVotes;

      //prototype function faster???
      let myfe = () => {
        var tr = false;
        voteList.forEach((e) => {if(e === pizzaId)tr = true;})
        return tr;
      }
      /*
      //this function is slower.. using for loops
      let tempBool = () => {
          for(let i = 0; i < voteList.length; i++){
            if(voteList[i] == pizzaId) return true;
          }
          return false; //if none are found in the array
      };
      */
      if(myfe()){
        return this.votedThumbDownImg;
      } else return this.thumbDownImg;
    }
    else return this.thumbDownImg;
  }

  private upVote(pizzaId: any){
    if(this.isLoggedIn){ //is logged in. theres a better function for this??
      Meteor.call('upVote', pizzaId, (error) =>{
        if(error){
          this.errors.push(error + error.reason + "|new error message|");
        } else {
          Session.set('viewDetailsId',  pizzaId); //help updating the dom
        }
      });
    }
    else alert("Pleas login or singup to vote.");
  }

  private downVote(pizzaId: any){
    if(this.isLoggedIn){ //is logged in. theres a better function for this??
      Meteor.call('downVote', pizzaId, (error) =>{
        if(error){
          this.errors.push(error + error.reason + "|new error message|");
        } else {
          Session.set('viewDetailsId',  pizzaId); //help updating the dom
        }
      });
    } else alert("Pleas login or singup to vote.");
  }


  private deletePizza(id: any){
    if(confirm('Are you sure you want to delete this pizza permanently?')){
      Meteor.call('deletePizza', id, (error) =>{
        if(error){
          this.errors.push(error + error.reason + "|new error message|");
        }
      });
    }
    this.logErrors();
  }

  private updatePizza(id: any, updateString?: string){
    if(this.isAdmin && this.isLoggedIn){
      Meteor.call('updatePizza', id, this.adminSelectUpdate, updateString, (error) =>{
        if(error){
          this.errors.push(error + error.reason + "|new error message|");
        }
      });
    }
    this.logErrors();
  }

  private exitDetails(){
    this.currentPizza = null;
    Session.set('currentPizza', null); //TODO toggle details not needed anymore
  }


  private selectDetails(id: any){
    Session.set('viewDetailsId',  id);
  }

  private toggleSignup(){
    this.viewSignup = !this.viewSignup;
  }

  private getRandomColor(shoutUser): string{
    if(this.chatColors.find(isListed)){
      return this.chatColors.find(isListed).color;
    } else {
      let color = 'rgb(' + getRandomInt(255) + ', ' + getRandomInt(255) + ', ' + getRandomInt(255) + ')';
      this.chatColors.push({
        user: shoutUser,
        color: color
      });
      return color;
    }
    //helper functions
    function isListed(list){
      if (list == null) {
        this.errors.push("|new error message|");
      }
      return list.user == shoutUser;
    }
    function getRandomInt(max) {
      return Math.floor(Math.random() * Math.floor(max));
    }
  }

  private getType(typeCode: number): string{
    let type = "";
    switch(Number(typeCode)){
      case 1: 
        type = "Frozen";
        break;
      case 2: 
        type = "Restaurant";
        break;
      case 3: 
        type = "Take N' Bake";
        break;
      case 4:
        type = "Delivery";
        break;
      default: 
        type = "None Selected";
      }
    return type;
  }

  private getTypeUrl(typeCode: number): string{
        //TODO CREATE A DATABASE WITH THE STYLES TO BE UPDATED WITHIN THE APP
    let type = "";
    switch(Number(typeCode)){
      case 1: 
        type = "/pictures/types/Frozen.png";
        break;
      case 2: 
        type = "/pictures/types/Restaurant.png";
        break;
      case 3: 
        type = "/pictures/types/TakenBake.png";
        break;
      case 4:
        type = "/pictures/types/Delivery.png";
        break;
      default: 
        type = "";
      }
    return type;
  }


  private getStyle(styleCode: number): string{
    let style = "";
    //UPDATE THE DATABASE WITH THE STYLES TO BE UPDATED WITHIN THE APP
    switch(Number(styleCode)){
      case 1: 
        style = "New York Style";
        break;
      case 2: 
        style = "Neopolitan";
        break;
      case 3: 
        style = "Tomato Pie";
        break;
      case 4: 
        style = "New Haven";
        break;
      case 5: 
        style = "Sicilian";
        break;
      case 6: 
        style = "Deep Dish";
        break;
      case 7: 
        style = "Stuffed";
        break;
      case 8: 
        style = "Detroit Style";
        break;
      case 9: 
        style = "St. Louis";
        break;
      case 10: 
        style = "California";
        break;
      case 11: 
        style = "Ohio Valley";
        break;
      case 12: 
        style = "Bar/Tavern";
        break;
      case 13: 
        style = "Grilled";
        break;
      case 14: 
        style = "Pan";
        break;
      case 15: 
        style = "Stuffed Crust";
        break;
      case 16: 
        style = "Vesuvio (Bombe)";
        break;
      case 17: 
        style = "Old Forge";
        break;
      case 18: 
        style = "Greek";
        break;
      case 19: 
        style = "Quad Cities";
        break;
      case 20: 
        style = "Colorado Mountain Pie";
        break;
      case 21: 
        style = "D.C. Jumbo";
        break;
      case 22: 
        style = "Brier Hill";
        break;
      case 23: 
        style = "Thin Crust";
        break;
      case 24: 
        style = "Pizza Strips";
        break;
      case 25: 
        style = "Hand Tossed";
        break;
      default:
        style ="No Style Selected";
    }
    return style;
  }

  private getStyleUrl(styleCode: number): string{
    let style = "";
    //UPDATE THE DATABASE WITH THE STYLES TO BE UPDATED WITHIN THE APP
    switch(Number(styleCode)){
      case 1: 
        style = "NewYork.png";
        break;
      case 2: 
        style = "Neapolitan.png";
        break;
      case 3: 
        style = "TomatoPie.png";
        break;
      case 4: 
        style = "NewHaven.png";
        break;
      case 5: 
        style = "Sicilian.png";
        break;
      case 6: 
        style = "DeepDish.png";
        break;
      case 7: 
        style = ""; //stuffed is the same as a DeepDish
        break;
      case 8: 
        style = "Detroit.png";
        break;
      case 9: 
        style = "StLouis.png";
        break;
      case 10: 
        style = "California.png";
        break;
      case 11: 
        style = "Ohio.png";
        break;
      case 12: 
        style = "Bar.png";
        break;
      case 13: 
        style = "Grilled.png";
        break;
      case 14: 
        style = "Pan.png";
        break;
      case 15: 
        style = "StuffedCrust.png";
        break;
      case 16: 
        style = "Vesuvio.png";
        break;
      case 17: 
        style = "OldForge.png";
        break;
      case 18: 
        style = "Greek.png";
        break;
      case 19: 
        style = "QuadCities.png";
        break;
      case 20: 
        style = "Colorado.png";
        break;
      case 21: 
        style = "DC.png";
        break;
      case 22: 
        style = "BrierHill.png";
        break;
      case 23: 
        style = "ThinCrust.png";
        break;
        case 24: 
        style = "PizzaStips.png";
        break;
        case 25: 
        style = "HandTossed.png";
        break;
      default:
        style =""; //default, no url given
    }
    return style;
  }

  private logErrors(){
    for(let i in this.errors){
      console.log(this.errors[i]);
    }
    this.errors = null; //reseting errors after printing them
  }

}

