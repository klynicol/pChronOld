import { Meteor } from 'meteor/meteor';
import { Injectable } from "@angular/core";


import { Observable } from 'rxjs/Observable';
import { MeteorObservable } from 'meteor-rxjs';

//PIZZA & SERVER DATABASES
import { ServerData } from '../../../both/collections/gaunt.collection';
import { ServerModel, PizzaModel } from '../../../both/models/gaunt.model';

/********************
----ERROR 802---------
*********************/

@Injectable()
export class CallServer{
	//init
	private errors: string[];

	//server database
	private serverData: Observable<ServerModel[]>;
  private serverSub: Subscription;
  private pizzaSub: Subscription;
  //finished the subs?
  private pizzaSubFinished: boolean = false;
  private serverSubFinished: boolean = false;

  //public Data 
	public values: ServerModel[] = [];  //TODO change variable name
  public pizzaSearchResult: PizzaModel[] = [];
 
  //right panel front page variables
  public newUsers: number;
  public revPosted: number;
  public newPizzaSubs: number;

	constructor(){
    /* init */
    this.errors = null;
    Session.setDefault('serverTime', ""); 

		//SUBSCRIBE TO THE SERVER
 		this.serverData = ServerData.find({}, {sort: {subDate: 1}}).zone();
  	MeteorObservable.subscribe('server').subscribe();


  	//push serverData onto the values array
  	let serverSub = this.serverData.subscribe(
      value => this.values = value,
      error => this.errors.push(error.reason + " |error802-1|"),
      () => this.serverSubFinished = true
    );

	}
  
  private addShout(content: string): void{
    if(content){
      Meteor.call('addShout', content, (error) =>{
        if (error){
          this.errors.push(error + error.reason + ' |ERROR802-2|');
        }
      });
      this.logErrors();
    }
  }

  private removeData(id: string): void{
    let date = 
    Meteor.call('removeServerData', id, (error) =>{
      if(error){
        this.errors.push(error + error.reason + ' |error802-3|');
      }
    });
    this.logErrors();
  }

  public searchPizzasString(searchType: string, input: string): void{
    if(searchType && input){
      try{
        if(searchType == "general"){
          //TODO
        }
        if(searchType == "brand"){
          console.log("test1");
          /* TODO WHEN THE SERVER IS NOT PUBLISHING ALL THE PIZZAS IN THE DATABASE
          Meteor.call('searchBrand', input , (error) =>{
            if (error){
              this.errors.push(error + error.reason + ' |error802-5|');
            }
            console.log("searchPizzasString else statement");
            this.updateSearchResult();
          });
          */
        }
        if(searchType == "reviews"){
          //TODO
        }
      } catch(e){
        this.errors.push(e + " " + e.reason + " |error802-4|");
      }
    }
    this.logErrors();
  }


  public searchPizzas(searchType: string, input: string): void{
    if(searchType && input){
      try{
        if(searchType == "type"){
          Meteor.call('searchType', input , (error) =>{
            if (error){
              this.errors.push(error + error.reason + ' |error802-5|');
            }
          });
        }
        if(searchType == "style"){
          //TODO
          Meteor.call('searchStyle', input , (error) =>{
            if (error){
              this.errors.push(error + error.reason + ' |error802-5|');
            }
          });
        }
      } catch(e){
        this.errors.push(e + " " + e.reason + " |error802-5|");
      }
    }
    this.logErrors();
  }

  private updateSearchResult(){ //Input an observable from collections.find()
    
    //TODO WHEN THE SERVER IS NOT PUBLISHING ALL THE PIZZAS IN THE SERVER
    /*
    let tempSub = Meteor.subscribe('searchResult');
    tempSub.subscribe(
      value => this.pizzaSearchResult = value,
      error => this.errors.push(error.reason + " |error802-1|"),
      () => this.pizzaSubFinished = true
    );
    tempSub.stop; //Stop the sub to get another set of data
    */
  }

  public chatInput(input: string,  admin: boolean): void{ //used by the app.component.ts via handleChat function
    if(input){
      try{
        let isCommand = false;
        let removeChars = input.replace(/[${}]/gi, ''); //removing brackets {} from input
        let trimInput = removeChars.trim();
        if(trimInput.startsWith("!")){
           isCommand = true;
           //TODO log commands being made by users ??
        }
        if(trimInput.length > 220){ //limit input length
          let temp1 = trimInput.substring(0, 220);
          trimInput = temp1 + "...";
        }
        if(!isCommand){ //add input to database
          this.addShout(trimInput);
        }
      }
      catch(e){
      this.errors.push(e + " " + e.reason + " |error802-6|");
      }
    this.logErrors();
    }
  }

  private logErrors(){
    for(let i in this.errors){
      console.log(this.errors[i]);
    }
    this.errors = null; //reseting errors after printing them
  }

}