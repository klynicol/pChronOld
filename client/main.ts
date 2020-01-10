import "angular2-meteor-polyfills";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.js";


import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import { enableProdMode } from "@angular/core";
import { AppModule } from "./imports/app";

import "./index.scss";

enableProdMode();
//starting point for the app.. bootstrapping what we need
Meteor.startup(() => {
   platformBrowserDynamic().bootstrapModule(AppModule);
});
