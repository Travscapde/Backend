// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var cardSchema = new Schema({
    id: { type: Schema.Types.ObjectId, default: mongoose.Types.ObjectId() },
    card_type: { type: String, required: true },
    likes: { type: Number, default: 0 },
    location: String,
    created_at: Date,
    updated_at: Date,

    user_info_id: { type: mongoose.Schema.Types.ObjectId, ref: 'UserInfo', required: true },
    url: String,
    thumbnail: String,
    title: String,
    interests: [String]
});

cardSchema.methods.like = function () {
    this.likes = this.name + 1;
};

cardSchema.pre('save', function (next) {
    var currentDate = new Date();
    this.updated_at = currentDate;

    if (!this.created_at)
        this.created_at = currentDate;

    next();
});

var Card = mongoose.model('Card', cardSchema);
module.exports = Card;