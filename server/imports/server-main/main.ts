import { Pizzas, ServerData } from "../../../both/collections/gaunt.collection";
import { PizzaModel, ServerModel } from "../../../both/models/gaunt.model";

import { Meteor } from 'meteor/meteor';



export class Main {

  /*---------------------------------------
------AUTO PUBLISHING DATA ON SERVER-------
-----------------------------------------*/

  publishUser(): void{
    Meteor.publish(null, function (){
        return Meteor.users.find({_id: this.userId}, {fields: //publishes the self
          {
            username: 1,
            upVotes: 1,
            downVotes: 1,
            pizzaSubs: 1,
            revSubs: 1,
            lastLogin: 1
          }
        });
    });
  }

  publishAllUsers(): void{
    Meteor.publish('allUsers', function(){
      return Meteor.users.find({}, {
        fields: {username: 1, createdAt: 1}
      });
    });
  }

/* deprecieted
  publishUserVotes(): void{
    Meteor.publish("votes", function(){
      return Meteor.users.find({}, {fields: {upVotes: 1, downVotes: 1}});
    });
  }
*/
  publishPizzas(): void{
    Meteor.publish('pizzas', function(){
      if(!Pizzas){
        throw new Meteor.Error('404', 'No Pizza group found');
      }
      return Pizzas.find({});  //publishing all the pizzas in the database
    });
  }


  publishServer(): void{
    Meteor.publish('server', () =>{
      if(!ServerData){
        throw new Meteor.Error('404', 'No ServerData group found');
      }
      return ServerData.find({}, {sort: {subDate: -1}, limit: 3}); //only publish 3 days of data
    })
  }
}


/*---------------------------------------
------ACCOUNT DATA STRUCTURE-------------
-----------------------------------------
-----------------------------------------
{
  _id: 'QwkSmTCZiw5KDx3L6',  // Meteor.userId()
  username: 'cool_kid_13', // Unique name
  emails: [
    // Each email address can only belong to one user.
    { address: 'cool@example.com', verified: true },
    { address: 'another@different.com', verified: false }
  ],
  createdAt: new Date('Wed Aug 21 2013 15:16:52 GMT-0700 (PDT)'),
  profile: {
    // The profile is writable by the user by default.
    name: 'Joe Schmoe'
  },
  services: {
    facebook: {
      id: '709050', // Facebook ID
      accessToken: 'AAACCgdX7G2...AbV9AZDZD'
    },
    resume: {
      loginTokens: [
        { token: '97e8c205-c7e4-47c9-9bea-8e2ccc0694cd',
          when: 1349761684048 }
      ]
    }
  }
}
--------------------------------------------
-----------------------------------------*/


