// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var cardSchema = new Schema({
    id: Schema.Types.ObjectId,
    username: { type: String, required: true, unique: true },
    card_type: { type: String, required: true },
    link: { type: String, required: true },
    likes: { type: Number, default: 0 },
    description: String,
    location: String,
    created_at: Date,
});

// custom method to add string to end of name
// you can create more important methods like name validations or formatting
// you can also do queries and find similar users 
cardSchema.methods.like = function() {
    // add some stuff to the users name
    this.likes = this.name + 1;
};


// on every save, add the date
cardSchema.pre('save', function(next) {
    // get the current date
    var currentDate = new Date();

    // change the updated_at field to current date
    this.updated_at = currentDate;

    // if created_at doesn't exist, add to that field
    if (!this.created_at)
        this.created_at = currentDate;

    next();
});

// we need to create a model using it
var Card = mongoose.model('Card', cardSchema);

// make this available to our users in our Node applications
module.exports = Card;