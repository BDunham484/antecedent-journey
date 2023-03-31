//import the schema constructor and the model function from Mongoose
const { Schema, model } = require('mongoose');

//create the schema for the model using the Schema constructor and outline the fields
const concertSchema = new Schema(
    {
        customId: {
            type: String,
            unique: true
        },
        artists: {
            type: String
        },
        artistsLink: {
            type: String
        },
        description: {
            type: String
        },
        date: {
            type: String
        },
        times: {
            type: String
        },
        venue: {
            type: String
        },
        address: {
            type: String
        },
        address2: {
            type: String
        },
        phone: {
            type: String
        },
        website: {
            type: String
        },
        email: {
            type: String
        },
        ticketLink: {
            type: String
        },
        yes: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
            }
        ],
        no: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
            }
        ],
        maybe: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
            }
        ]
    },
    {
        toJSON: {
            virtuals: true
        }
    }
);

//get total count of yes rsvp's on retrieval
concertSchema.virtual('yesCount').get(function () {
    return this.yes.length;
});

//get total count of no rsvp's on retrieval
concertSchema.virtual('noCount').get(function () {
    return this.no.length;
});

//get total count of maybe rsvp's on retrieval
concertSchema.virtual('maybeCount').get(function () {
    return this.maybe.length;
});

//create the Concert model using the concertSchema
const Concert = model('Concert', concertSchema);

//export the Concert model
module.exports = Concert;