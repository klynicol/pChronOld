import { Component, NgZone, ViewChild } from "@angular/core";
import { FormsModule } from '@angular/forms';


//THIS COMPONENT
//import template from "./pizzaSubmit.component.html";
//import style from "./pizzaSubmit.component.scss";

//CHILD COMPONENTS
import { ModalComponent } from '../modal/modal.component';

interface formValues{ //this information is retrieved from the HTML submit form
	type: number;
	description: string;
	style: number;
	brand: string;
	location: {
		state: string;
		country: string;
	}
	price: number;
	imageUrl: string;
	newStyle: string;
	newStyleDescrip: string;
}

@Component({
  selector: "pizzaSubmitModal",
  templateUrl: './pizzaSubmit.component.html',
  styleUrls: [ './pizzaSubmit.component.scss' ]
})

export class PizzaSubmitComponent {
	/*---------------------------------------------------------------
	----THIS COMPONENT IS TEMPLATE DRIVEN FOR ITS FORM VALIDATION----
	---------------------------------------------------------------*/

	@ViewChild('modalComp') modalCompRef; //reference to Modal Component

	//init
	errors: Array<string>;
	message: string;

	//form values
	values: formValues;


	constructor(private zone: NgZone){
		//init
		this._resetFormFields();
    	this.resetErrors();
	}

    /*---------------INIT ---- ---
  -------------------------------
  -------------------------------*/

	_resetFormFields() {
    	this.values = { 
    		description: '', 
    		type: 0, 
    		style: 0, 
    		brand: '', 
    		location: {state: '', country: '' }, 
    		price: 0, 
    		imageUrl: '', 
    		newStyle: '',
    		newStyleDescrip:''
    		};
  	}

  	resetErrors() {
    	this.errors = [];
    	this.message = "";
  	}

  	/*------START OF METHODS ------
	-------------------------------
	-------------------------------*/

  	//Form Validation is done in the template
  	onSubmit(){
	    if(Meteor.user()){
	      const data = {
	      	type: this.values.type,
			description: this.values.description,
			style: this.values.style,
			brand: this.values.brand,
			location: {
				state: this.values.location.state,
				country: this.values.location.country
			},
			imageUrl: this.values.imageUrl
	      };
	      //submit the new pizza to the database
	      Meteor.call('submitPizza', data, (error) => {
	      	if(error){
	      		this.errors.push(error + error.reason + "|new Error code|");
	      	}
	      });
	      //submit a new style if a new one has been subbed
  	      if(this.values.newStyle){ 
  	      	const styleBuild = {
  	      		newStyle: this.values.newStyle,
  	      		newStyleDescrip: this.values.newStyleDescrip
  	      	};
	      	Meteor.call('submitPizza', styleBuild, (error) => {
		      	if(error){
		      		this.errors.push(error + error.reason + "|new Error code|");
		      	}
	      	});
	      }
	      //push the pizza id onto the users data
	      
	      this.modalCompRef.hide(); //hide the modal
	      this._resetFormFields(); //reset fields in the modal
	      alert("Thanks, pizza was sent to the admin group for approval");

	    } else{
	    	console.log("Something went wrong with the login or the form isnt valid");
	    }
	    this.logErrors();
  	}

  	//submit a new style



  	showModal(){
     this.modalCompRef.show()
   }

   private logErrors(){
   	for(let i in this.errors){
   		console.log(this.errors[i]);
   	}
   }

}
