
/*new pizzas are initiated on server via submitPizza*/
export interface PizzaModel{
	type: number;
	description: string;
	style: number;
	styleUrl ?: string;
	brand: string;
	brandUrl ?: string;
	location: {
		state: string;
		country: string;
	};
	priceReport: [{price: number; user: string}];
	msrp ?: number;
	imageUrl: string;
	upvotes: number;
	downvotes: number;
	votes: number;
	userUpvotes: Array <string>;
	userDownvotes: Array<string>;
	reviewedByAdmin: boolean;
	reviews: [{
		revCreatedAt: Date;
		revCreatedBy: string;
		revRating: number;
		revText: string;
	}];
	submittedBy: string;
	createdAt: Date;
}

//updated 1/2/18
export interface ServerModel{
	id ?: string;
	subDate: number;
	newPizzaSubs: number;
	newUsers: number;
	revPosted: number;
	shoutCount: number;
	delUsers: number;
	allUpvotes: number;
	allDownvotes: number;
	shouts: [{
		shoutUser: string;
		shoutContent: string;
		shoutTime: Date;
	}];
}

export interface Styles{
	user: string;
	styleName: string;
	styleDes: string;
	styleReviewed: boolean;
	styleUrl?: string;
}