
//ServiceConfiguration cannot currently be added to Typscript
//To add to typscrip look into adding https://github.com/DefinitelyTyped
Meteor.startup(() => {
ServiceConfiguration.configurations.remove({ //remove??
    	service: "facebook"
	});

	ServiceConfiguration.configurations.insert({
    	service: "facebook",
    	appId: '874427352707878',
    	secret: '8a8f3f41adcee3607452fb4da23336d4'
	});
});