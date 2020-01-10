import { Component, NgZone, ViewChild, Input } from "@angular/core";
import { Observable } from 'rxjs/Observable';
import { MeteorObservable } from 'meteor-rxjs';
import { Session } from 'meteor/session';


//CHILD COMPONENTS
import { ModalComponent } from '../modal/modal.component';

//pizza model for the search
import { PizzaModel } from '../../../../../both/models/gaunt.model';
import { Pizzas } from '../../../../../both/collections/gaunt.collection';


@Component({
  selector: "searchModal",
  templateUrl: './searchModal.component.html',
  styleUrls: [ './searchModal.component.scss']
})

export class SearchModalComponent {
  //INIT
	@ViewChild('modalComp') modalCompRef; //reference to Modal Component
	errors: Array<string>;
	autorunComputation: Tracker.Computation;

  //Inputs from main component
  @Input() currentPizza;

  //model for search results
  private results: Observable<PizzaModel[]>;

  //html elements
  modalTitle: string = "";


  //TODO, This a temp array holding the pizzas found from searching the database
  //since all pizzas are being published right now, there's no  need for a publish function on the server
  //in the future when the list is big there might need to be a separate publish?
  pizzasFound: PizzaModel[] = [];
  pizzaPushFinished: boolean = false;

	constructor(private zone: NgZone){
		this._initAutorun();


		this._logErrors();
	}

	private _initAutorun(): void {
		this.autorunComputation = Tracker.autorun(() => {
			this.zone.run(() => {
			//tracker items
			});
		});
	}

  /*CALLS FROM THE PARENT COMPONENT TO DISPLAY SIMILAR PIZZAS*/
    public showSameStyles(style: number){
      this.results = Pizzas.find({style: {$eq: style}}, {sort: {votes: -1}});
    }
    public showSameTypes(type: number){
      this.results = Pizzas.find({type: {$eq: type}}, {sort: {votes: -1}});
    }


  public showModal(selectSearch?: any){
    try{
      if(selectSearch){
        switch(selectSearch){
          case 'style':
            this.modalTitle = "All " + this.getStyle(this.currentPizza.style) + " Pizzas";
            this.showSameStyles(this.currentPizza.style);
            break;
          case 'type':
            this.modalTitle = "All " + this.getType(this.currentPizza.type) + " Pizzas";
            this.showSameTypes(this.currentPizza.type);
            break;
        }
      }
      this.modalCompRef.show();
    } catch (e){
      this.errors.push(e + " " + e.reason + " |error802-5|");
    }
     this._logErrors();
  }

  private viewPizza(id: string){
    Session.set('viewDetailsId', id );
    this.modalCompRef.hide();
  }

  private handleSearch(input: string){
      this.pizzasFound = []; //set it back empty
      //this.serverObj.searchPizzasString(this.searchType, input);   //call to the server class

      //TODO, TEMP SEARCH FUNCTIONS BECAUSE ALL PIZZAS ARE BEING PUBLISHED FROM THER SERVER RIGHT NOW
      let foundPizza = Pizzas.find({ brand: { $regex: new RegExp(input, "i")}});
      foundPizza.subscribe(
        value => this.pizzasFound = value,
        error => this.errors.push(error.reason + " |error802-1|"),
        () => this.pizzaPushFinished = true
      );
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

	private _logErrors(){
		for(let i in this.errors){
			console.log(this.errors[i]);
		}
		this.errors = [];
	}

}