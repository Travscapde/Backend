var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userInfoSchema = new Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    date_of_birth: Number,
    home: String,
    living_in: String,
    profile_pic: String,
    facebook_id: String,
    created_at: Date,
    updated_at: Date,
    interests: [String],
    photo_count: { type: Number, default: 0 },
    seen_list: [Schema.Types.ObjectId],
    like_list: [Schema.Types.ObjectId],
    bucket_list: [Schema.Types.ObjectId]
});

userInfoSchema.methods.dudify = function () {
};

// on every save, add the date
userInfoSchema.pre('save', function (next) {
    var currentDate = new Date();
    this.updated_at = currentDate;
    if (!this.created_at)
        this.created_at = currentDate;

    next();
});

userInfoSchema.methods.newPhotoUpload = function () {
    this.photo_count = this.photo_count + 1;
};

var UserInfoSchema = mongoose.model('UserInfoSchema', userInfoSchema);
module.exports = UserInfoSchema;