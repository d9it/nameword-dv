const mongoose = require('mongoose');
const { Schema } = mongoose;

const domainSchema = new Schema({
	user: { type: Schema.Types.ObjectId, ref: 'user', required: true },
	domainNameId: { type: Number, required: true, },
	customerId: { type: Schema.Types.Mixed, required: true, },	
	websiteName: { type: String, required: true },
	provider: { type: String, required: false },
	orderDate: { type: Date, required: true },
	expirationDate: { type: Date, required: true },
	price: { type: Schema.Types.Decimal128, required: true },
	cloudflare: {
		zoneId: { type: String, required: false },
	},
}, {
	timestamps: true,
	toJSON: {
		transform(doc, ret) {
			ret.id = ret._id;
			ret.price = parseFloat(ret.price.toString());
			delete ret.user;
			delete ret._id;
			delete ret.__v;
		}
	}
});

const Domain = mongoose.model('domain', domainSchema);
module.exports = Domain;