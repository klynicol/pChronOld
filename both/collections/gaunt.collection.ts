
import { MongoObservable } from "meteor-rxjs";
import { PizzaModel, ServerModel, Styles } from "../models/gaunt.model";

export const Pizzas = new MongoObservable.Collection<PizzaModel>("pizzas");
export const ServerData = new MongoObservable.Collection<ServerModel>("server");
export const StylesList = new MongoObservable.Collection<Styles>("styles");