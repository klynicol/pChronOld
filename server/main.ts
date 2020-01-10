import { Main } from "./imports/server-main/main";
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { UniHTML } from 'meteor/vazco:universe-html-purifier';

//import server database and model
import { ServerData, Pizzas, StylesList } from "../both/collections/gaunt.collection";
import { ServerModel, PizzaModel, Styles } from "../both/models/gaunt.model";

//roles from alanning
import { Roles } from 'meteor/alanning:roles';

/********************
----ERROR M500---------
*********************/

//helper functions
function addZero(i) {
  if (i < 10) {
      i = "0" + i;
  }
  return i;
}
function nonMilitary(j){
  return ((j + 11) % 12 + 1);
}
function amPM(k){
  if(k >= 12){
    return "PM";
  }
  else return "AM";
}
function dayControl(time1, time2){
	if(time1 > time2 + 86400000){ //if a day has passed
		return new Date().getTime();
	}
	else return time1;
}
function addServerDay(date): string{
	const data: ServerModel = {
      subDate: date,
      newPizzaSubs: 0,
      newUsers: 0,
      revPosted: 0,
      shoutCount: 0,
      delUsers: 0,
      allUpvotes: 0,
      allDownvotes: 0,
      shouts: [{
        shoutUser: "Server",
        shoutContent: String(new Date()),
        shoutTime: null
      }]
    };
	return ServerData.collection.insert(data);
}
function getTime(): number{  //Returns a sortable number for the current day
	let date = new Date();
	let yearString = String(date.getFullYear());
	let month = date.getMonth() + 1;
	let day = date.getDate();
	let monthString = "";
	let dayString = "";
	if(month < 10){
		monthString = "0" + month;
	} else monthString = String(month);
	if(day < 10){
		dayString = "0" + day;
	} else dayString = String(day);
	let concat = "" + yearString + monthString + dayString;
	return Number(concat);
}

/*-------EMOTES------*/
function getEmotes(input: string): string{
	let temp = "";
    if(input.includes("thumbsup")){
      	temp = input.replace("thumbsup", "<img src='/pictures/VotedThumbsUp.png'>");
      	input = temp;
    }
    if(input.includes("thumbsdown")){
    	temp = input.replace("thumbsdown", "<img src='/pictures/ThumbsDown.png'>");
    	input = temp;
    }
    return input;
}

/*-------SERVER STARTUP--------
------------------------------*/


Meteor.startup(() => {
	const mainInstance = new Main();




	/*----RATE LIMITER-------
	-------------------------
	-----------------------*/
	//DDPRateLimiter.addRule() TODO

	//PUBLISH THE DATABASES
	mainInstance.publishPizzas();
	/*
	Pizzas.collection._ensureIndex('pizzas',)
	Pizzas.rawCollection().createIndex({
		description: "text",
		brand: "text",
		location: {
			state: "text",
			country: "text"
		},
		reviews: [{ revText: "text"}],
		submittedBy: "text"
	}); //allow searching strings on pizza database
	TODO index this collection to make is searchable by string.
	*/
	mainInstance.publishUser();
	mainInstance.publishAllUsers();
	mainInstance.publishServer();


	Accounts.onCreateUser(function(options, user){
	//adding upvotes and downvotes
		user.upVotes = [];
		user.downVotes = [];
		user.pizzaSubs = [];
		user.revSubs = [];
		user.lastLogin = "";
		if (options.profile) {
      		user.profile = options.profile;
    	}
		return user;
	});

	
	Meteor.methods({

		/****************************
		------ USER FUNCTIONS-------
		*****************************/

		addUser: function(credentials){
			let loggedInUser = Accounts.createUser(credentials); //hopefully oncreate user is called after this.
			if(loggedInUser){
				//add users to default role
				Roles.addUsersToRoles(loggedInUser, 'user');
				try{
			      /*-- update the user and server databases---*/
				  let serverTime = getTime();
				  let query = ServerData.findOne({subDate: serverTime});
				  if(!query){
				  	let id = addServerDay(serverTime);
				  	ServerData.update(id, {$inc: {newUsers: 1}});
				  } else ServerData.update(query._id, {$inc: {newUsers: 1}});
			   	} catch(e) {
			   		throw new Meteor.Error(e + e.reason, "|Throw new error|");
			   	}
			}
			else throw new Meteor.Error("504", "user not logged in");
		},
		checkUsername: function(name){
			if(Accounts.findUserByUsername(name)){
				return true;
			} else return false;
		},
		userPizzaSubs: function(pizzaID){
			var loggedInUser = Meteor.user();
			if (!loggedInUser || !Roles.userIsInRole(loggedInUser,['admin', 'user'])){
				throw new Meteor.Error(403, "Access denied");
			} else {
				console.log("test1" + String(pizzaID));
				Meteor.users.update(loggedInUser._id, {$push: {pizzaSubs: pizzaID}});
			}
		},
		userReviewSubs: function(){
			var loggedInUser = Meteor.user();
			if (!loggedInUser || !Roles.userIsInRole(loggedInUser,['admin', 'user'])){
				throw new Meteor.Error(403, "Access denied");
			} else {
				Meteor.users.update(loggedInUser._id, {$set: {lastLogin: String(new Date())}});
			}
		},
		lastLogin: function(){
			var loggedInUser = Meteor.user();
			if (!loggedInUser || !Roles.userIsInRole(loggedInUser,['admin', 'user'])){
				throw new Meteor.Error(403, "Access denied");
			} else {
				Meteor.users.update(loggedInUser._id, {$set: {lastLogin: String(new Date())}});
			}
		},

		/****************************
		------ ADMIN FUNCTIONS-------
		*****************************/

		checkAdmin: function(){
			var loggedInUser = Meteor.user();
		    if (!loggedInUser || !Roles.userIsInRole(loggedInUser,'admin')){
		      throw new Meteor.Error(403, "Access denied");
		    } else {
		    	return Roles.userIsInRole(this.userId, 'admin');
		    }
		},
		makeAdmin: function(user){
		    var loggedInUser = Meteor.user();
		    if (!loggedInUser || !Roles.userIsInRole(loggedInUser,'admin')){
		      throw new Meteor.Error(403, "Access denied");
		    } else {
		    	Roles.setUserRoles(user, 'admin'); //chaning role from user to admin
		    }
		},
		deleteUser: function (user) {
		    var loggedInUser = Meteor.user();
		    if (!loggedInUser || !Roles.userIsInRole(loggedInUser,'admin')){
		      throw new Meteor.Error(403, "Access denied");
		    } else {
		    	Meteor.users.remove({username: user});
		    }
		},
		findUser: function(name){
			var loggedInUser = Meteor.user();
			if (!loggedInUser || !Roles.userIsInRole(loggedInUser,'admin')){
				throw new Meteor.Error(403, "Access denied");
			} else {
				var userFound = Accounts.findUserByUsername(name);
				if(userFound){
				    return userFound;
				} else throw new Meteor.Error("M607", "User not found in the datbase");
			}
		},

		/****************************
		------ PIZZA DATABASE---------
		*****************************/

		submitPizza: function(data){
			var loggedInUser = Meteor.user();
			if (!loggedInUser || !Roles.userIsInRole(loggedInUser,['user','admin'])){
		      	throw new Meteor.Error("M504", "Access denied");
		    } else {
		    	try{
		    		let insertedPizza: any;
					const model: PizzaModel[] = [{
				      	type: data.type,
						description: data.description,
						style: data.style,
						brand: data.brand,
						location: {
							state: data.location.state,
							country: data.location.country
						},
						priceReport: null,
						msrp: 0,
						imageUrl: data.imageUrl,
						upvotes: 0,
						downvotes: 0,
						votes: 0,
						userUpvotes: [],
						userDownvotes: [],
						reviewedByAdmin: false,
						reviews: [{
							revCreatedAt: Date.prototype,
							revCreatedBy: '',
							revRating: 0,
							revText: ''
						}],
						submittedBy: Meteor.user().username,
						createdAt: new Date()
				      }];
			      model.forEach((obj: PizzaModel) => {
			      	 insertedPizza = Pizzas.collection.insert(obj); //added .collection to get Id instead of Observable
			      });
			      Meteor.users.update(loggedInUser._id, {$push: {pizzaSubs: insertedPizza}}); //push insert Id onto user to keep track of submits
			      /*---UPDATE THE SERVER WITH A NEW DAY IF NEEDED--*/
				  let serverTime = getTime();
				  let query = ServerData.findOne({subDate: serverTime});
				  if(!query){
				  	let id = addServerDay(serverTime);
				  	ServerData.update(id, {$inc: {newPizzaSubs: 1}});
				  } else ServerData.update(query._id, {$inc: {newPizzaSubs: 1}}); //update the server for the daily submit count
			   } catch(e) {
			   		throw new Meteor.Error(e + e.reason, "|Throw new error|");
			   }
			}
		},
		updatePizza:function (id, select, updateString?) {
		    var loggedInUser = Meteor.user();
		    if (!loggedInUser || !Roles.userIsInRole(loggedInUser,'admin')){
		      throw new Meteor.Error(403, "Access denied");
		    } else {
		    	switch(select){
		    		case "reviewedByAdmin":
		    			Pizzas.update(id, {$set: {reviewedByAdmin: true}});
		    			break;
	    			case "description":
	    				if(updateString){
	    					Pizzas.update(id, {$set: {description: updateString}});
	    				} else throw new Meteor.Error(403, "No String given");
		    			break;
	    			case "brand":
	    				if(updateString){
	    					Pizzas.update(id, {$set: {brand: updateString}});
	    				} else throw new Meteor.Error(403, "No String given");
		    			break;
	    			case "brandUrl":
	    				if(updateString){
	    					Pizzas.update(id, {$set: {brandUrl: updateString}});
	    				} else throw new Meteor.Error(403, "No String given");
		    			break;
	    			case "styleUrl":
	    				if(updateString){
	    					Pizzas.update(id, {$set: {styleUrl: updateString}});
	    				} else throw new Meteor.Error(403, "No String given");
		    			break;
	    			case "imageUrl":
	    				if(updateString){
	    					Pizzas.update(id, {$set: {imageUrl: updateString}});
	    				} else throw new Meteor.Error(403, "No String given");
		    			break;
	    			case "state":
	    				if(updateString){
	    					let pizza = Pizzas.findOne(id); //query to get the old country
	    					Pizzas.update(pizza._id, {$set: {location: {state: updateString, country: pizza.location.country}}});
	    				} else throw new Meteor.Error(403, "No String given");
		    			break;
	    			case "country":
	    				if(updateString){
	    					let pizza = Pizzas.findOne(id); //queryt to get the old state
	    					Pizzas.update(pizza._id, {$set: {location: {state: pizza.location.state, country: updateString}}});
	    				} else throw new Meteor.Error(403, "No String given");
		    			break;
		    		case "":
		    			throw new Meteor.Error(403, "No update selection given");
	    			default:
		    			throw new Meteor.Error(403, "No update selection given, default case");
		    	}
		    }
		},
		deletePizza: function (id) {
		    var loggedInUser = Meteor.user();
		    if (!loggedInUser || !Roles.userIsInRole(loggedInUser,'admin')){
		      throw new Meteor.Error(403, "Access denied");
		    } else {
		    	Pizzas.remove({_id: id});
		    }
		},
		//SEARCH FUNCTIONS
		searchGeneral: function(searchString){
			//TODO IS THIS METHOD SECURE THIS METHOD WILL COME FROM THE TEXT INDEX CREATED
			//ON THE #description AND #brand DATA .... https://docs.mongodb.com/manual/text-search/
			try{
				Pizzas.find({});
			} catch(e){
				throw new Meteor.Error(e + "|Throw new error|");
			}
		},
		searchBrand: function(searchString){
			//TODO IS THIS METHOD SECURE
			try{
				return Pizzas.find({ brand: { $eq: searchString }});
			} catch(e){
				throw new Meteor.Error(e + "|Throw new error|");
			}
		},
		searchReviews: function(searchString){
			//TODO IS THIS METHOD SECURE THIS METHOD WILL COME FROM THE TEXT INDEX CREATED
			//ON THE #description AND #brand DATA .... https://docs.mongodb.com/manual/text-search
			//HOW TO SEARCH FOR STRINGS INSIDE AN ARRAY OF OBJECTS
			try{
				Pizzas.find({});
			} catch(e){
				throw new Meteor.Error(e + "|Throw new error|");
			}
		},
		searchType: function(typeNumber){
			//TODO IS THIS METHOD SECURE
			try{
				Pizzas.find({});
			} catch(e){
				throw new Meteor.Error(e + "|Throw new error|");
			}
		},
		searchStyle: function(StyleNumber){
			//TODO IS THIS METHOD SECURE
			try{
				Pizzas.find({});
			} catch(e){
				throw new Meteor.Error(e + "|Throw new error|");
			}
		},
		upVote: function(pizzaId){
			var loggedInUser = Meteor.user();
			if (!loggedInUser || !Roles.userIsInRole(loggedInUser,['user','admin'])){
		      	throw new Meteor.Error("M504", "Access denied");
		    } else {
		    	let pizzaInQuestion = Pizzas.findOne({_id: pizzaId});
		    	let listUp = pizzaInQuestion.userUpvotes;
				let listDown = pizzaInQuestion.userDownvotes;
				if(listUp.indexOf(loggedInUser.username) === -1 && listDown.indexOf(loggedInUser.username) != -1){
					Pizzas.update(pizzaId, { //This vote is cast only if a downvote has already been made
					    $push: { userUpvotes: loggedInUser.username},
					    $pull: { userDownvotes: loggedInUser.username},
					    $inc: { votes: 2 }}); //2 to counteract the previous downvote
					Meteor.users.update(loggedInUser._id, { //pizza Id popped to user array
						$push: {upVotes: pizzaId},
						$pull: {downVotes: pizzaId}
					});
					/*update server with daily vote count*/
					let time = getTime();
					let id = ServerData.findOne({subDate: time})._id;
				  	if(!id){
				  		id = addServerDay(time);
				  	}
					ServerData.update(id, {
						$inc: {
							allUpvotes: 1,//push
							allDownvotes: -1//pull
						}
					}); 
				}
				else if(listUp.indexOf(loggedInUser.username) === -1){
					Pizzas.update(pizzaId, { //This is regular vote
						$push: { userUpvotes: loggedInUser.username},
						$inc: { votes: 1 }});
					Meteor.users.update(loggedInUser._id, {
						$push: {upVotes: pizzaId}
					});
					/*update server with daily vote count*/
					let time = getTime();
					let id = ServerData.findOne({subDate: time})._id;
				  	if(!id){
				  		id = addServerDay(time);
				  	}
					ServerData.update(id, {$inc: {allUpvotes: 1}}); //push
				}
				else throw new Meteor.Error("M504", "User already upvoted this pizza");
			}
		},
		//VOTING FUNCTIONS
		downVote: function(pizzaId){
			var loggedInUser = Meteor.user();
			if (!loggedInUser || !Roles.userIsInRole(loggedInUser,['user','admin'])){
		      	throw new Meteor.Error("M504", "Access denied");
		    } else {
		    	let listDown = Pizzas.findOne({_id: pizzaId}).userDownvotes;
				let listUp = Pizzas.findOne({_id: pizzaId}).userUpvotes;
				if(listDown.indexOf(loggedInUser.username) === -1 && listUp.indexOf(loggedInUser.username) != -1){
					Pizzas.update(pizzaId, { //This vote is only cast if a upvotes has already been made
					    $push: { userDownvotes: loggedInUser.username},
					    $pull: { userUpvotes: loggedInUser.username},
					    $inc: { votes: -2 } //-2 to counteract the previous upvote
					}); 
					Meteor.users.update(loggedInUser._id, { //pizza Id popped to to user array
						$push: {downVotes: pizzaId},
						$pull: {upVotes: pizzaId}
					});
					/*update server with daily vote count*/
					let time = getTime();
					let id = ServerData.findOne({subDate: time})._id;
				  	if(!id){
				  		id = addServerDay(time);
				  	}
					ServerData.update(id, {
						$inc: {
							allDownvotes: 1,//push
							allUpvotes: -1//pull
						}
					}); 
				}
				else if(listDown.indexOf(loggedInUser.username) === -1){
					Pizzas.update(pizzaId, { 
						$push: { userDownvotes: loggedInUser.username},
						$inc: { votes: -1 }
					});
					Meteor.users.update(loggedInUser._id, {$push: {downVotes: pizzaId}} );
					/*update server with daily vote count*/
					let time = getTime();
					let id = ServerData.findOne({subDate: time})._id;
				  	if(!id){
				  		id = addServerDay(time);
				  	}
					ServerData.update(id, {$inc: {allDownvotes: 1}}); //push
				}
				else throw new Meteor.Error("M504", "User already downvoted this pizza");
		    }
		},


		/****************************
		------ SERVER DATA-----------
		*****************************/

		addShout: function(content){
			if(!content){
				throw new Meteor.Error("M505", "Content is null");
			}
			let sanInput = UniHTML.purify(content); //taking uneccessary HTML out using the purify library
			let readyContent = getEmotes(sanInput); //checking for emotes and replacing them with html img tags
			var loggedInUser = Meteor.user();
		    if (!loggedInUser || !Roles.userIsInRole(loggedInUser,['user','admin'])){
		      throw new Meteor.Error("M504", "Access denied");
		    } else {
			    let date = new Date();
			    let serverTime = getTime();
			    let query = ServerData.findOne({subDate: serverTime});
			    if (query){
				    let hours = date.getHours();
				    let time = "(" + addZero(nonMilitary(hours)) + ":" + addZero(date.getMinutes()) + " " + amPM(hours) + ")";
			    	ServerData.update(query._id, { $push: 
			    		{ shouts: 
			    			{ shoutUser: loggedInUser.username, 
			    				shoutContent: readyContent, 
			    				shoutTime: time 
			    			}
			    		}
			    	});
			    }
			    else{
			    	addServerDay(serverTime);
			    	console.log("Added new Day " + serverTime +  " to server data");
			    	let nextQuery = ServerData.findOne({subDate: serverTime});
				    if (nextQuery){
					    let hours = date.getHours();
					    let time = "(" + addZero(nonMilitary(hours)) + ":" + addZero(date.getMinutes()) + " " + amPM(hours) + ")";
				    	ServerData.update(nextQuery._id, { $push: 
				    		{ shouts: 
				    			{ shoutUser: loggedInUser.username, 
				    				shoutContent: readyContent, 
				    				shoutTime: time 
				    			}
				    		}
				    	});
				    }
				    else throw new Meteor.Error("M505", "Server data was not found");
			    }
		    }
		},
		removeServerData: function(id){
			if(!id){
				throw new Meteor.Error("M501", "ID is null");
			}
			var loggedInUser = Meteor.user();
		    if (!loggedInUser || !Roles.userIsInRole(loggedInUser,'admin')){
		    	throw new Meteor.Error("M501", "Access denied");
		    } else{
		    	ServerData.remove({_id: id});
		    }
		},

		/****************************
		------ SUBMIT A NEW STYLE----
		*****************************/
		submitNewStyle(data){
			var loggedInUser = Meteor.user();
			if (!loggedInUser || !Roles.userIsInRole(loggedInUser,['user','admin'])){
		      	throw new Meteor.Error("M504", "Access denied");
		    } else {
		    	try{
					const styleBuild: Styles[] = [{
				      	user: this.userId(),
						styleName: data.newStyle,
						styleDes: data.newStyeDescrip,
						styleReviewed: false,
						styleUrl: ""
				      }];
			      styleBuild.forEach((obj: Styles) => {
			      	 StylesList.insert(obj);
			      });
		    	} catch(e){
		    		throw new Meteor.Error(e + e.reason, "|Throw new error|");
		    	}
			}
		}

	}); //end of Meteor.methods()


	/*------------------------------------------
  -----COLLECTION SECURITY--------------------
  ------------------------------------------*/
  Meteor.users.deny({
    insert() { return true; },
    update() { return true; },
    remove() { return true; }
  });

  ServerData.deny({
    insert() { return true; },
    update() { return true; },
    remove() { return true; }
  });

  Pizzas.deny({
    insert() { return true; },
    update() { return true; },
    remove() { return true; }
  });


});

