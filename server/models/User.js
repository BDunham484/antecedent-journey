//import the Schema constructor and the model function from Mongoose
const { Schema, model } = require('mongoose');
//import bcrypt package for password encryption
const bcrypt = require('bcrypt');
//import the Concert model
const Concert = require('./Concert');


//create the schema for the model using the Schema constructor and outline the fields
const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 3
        },
        email: {
            type: String,
            required: true,
            unique: true,
            match: [/.+@.+\..+/, 'Must match an email address!']
        },
        password: {
            type: String,
            required: true,
            minlength: 5
        },
        concerts: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Concert'
            }
        ],
        friends: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User'
            }
        ],
        receivedRequests: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User'
            }
        ],
        sentRequests: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User'
            }
        ],
        blockedUsers: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User'
            }
        ]
    },
    {
        toJSON: {
            virtuals: true
        }
    }
);

//set up pre-save middleware to create password
userSchema.pre('save', async function (next) {
    if (this.isNew || this.isModified('password')) {
        const saltRounds = 10;
        this.password = await bcrypt.hash(this.password, saltRounds);
    }

    next();
});

// compare the incoming password with the hashed password
userSchema.methods.isCorrectPassword = async function (password) {
    return bcrypt.compare(password, this.password);
};

//get total count of concerts on retrieval
userSchema.virtual('concertCount').get(function () {
    return this.concerts.length;
});

//get total count of friends on retrieval
userSchema.virtual('friendCount').get(function () {
    return this.friends.length;
});

//get total count of sentRequests + receivedRequests on retrieval
userSchema.virtual('requestCount').get(function () {
    return (this.sentRequests.length + this.receivedRequests.length);
})

//get total count of sentRequest
userSchema.virtual('sentCount').get(function () {
    return this.sentRequests.length;
})

//get total count of sentRequest
userSchema.virtual('receivedCount').get(function () {
    return this.receivedRequests.length;
})

//get total count of blockedUsers
userSchema.virtual('blockedCount').get(function () {
    return this.blockedUsers.length;
})

//create the User model using the userSchema
const User = model('User', userSchema);

//export the User model
module.exports = User;