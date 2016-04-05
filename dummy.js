var method = dummy.prototype;

function dummy() {
    //create dummy jsons
}


method.getImage = function() {
    var imgs = ["https://s3-ap-southeast-1.amazonaws.com/travnet/1.jpg"];
    return { "image": imgs };
}

method.getImages = function() {
    var imgs = ["https://s3-ap-southeast-1.amazonaws.com/travnet/1.jpg",
        "https://s3-ap-southeast-1.amazonaws.com/travnet/2.jpg",
        "https://s3-ap-southeast-1.amazonaws.com/travnet/3.jpg",
        "https://s3-ap-southeast-1.amazonaws.com/travnet/4.jpg",
        "https://s3-ap-southeast-1.amazonaws.com/travnet/5.jpg",
        "https://s3-ap-southeast-1.amazonaws.com/travnet/6.jpg",
        "https://s3-ap-southeast-1.amazonaws.com/travnet/7.jpg",
        "https://s3-ap-southeast-1.amazonaws.com/travnet/8.jpg",
        "https://s3-ap-southeast-1.amazonaws.com/travnet/9.jpg",
        "https://s3-ap-southeast-1.amazonaws.com/travnet/10.jpg"]

    return { "image": imgs };
}

method.getCards = function() {
    /*
    id: Schema.Types.ObjectId,
    username: { type: String, required: true, unique: true },
    card_type: { type: String, required: true },
    link: { type: String, required: true },
    likes: { type: Number, default: 0 },
    description: String,
    location: String,
    created_at: Date,
    */

    var json1 = {
        "description": "Chilling",
        "user-name": "Joy",
        "user-img": "https://s3-ap-southeast-1.amazonaws.com/travnet/user1.jpg",
        "card-type": "image",
        "link": "https://s3-ap-southeast-1.amazonaws.com/travnet/1.jpg",
        "likes": "213",
        "location": "Bali, Indonesia"
    };

    var json2 = {
        "description": "Chiling",
        "user-name": "Joy",
        "user-img": "https://s3-ap-southeast-1.amazonaws.com/travnet/user1.jpg",
        "card-type": "image",
        "link": "https://s3-ap-southeast-1.amazonaws.com/travnet/2.jpg",
        "likes": "35",
        "location": "Maldives"
    };

    var json3 = {
        "description": "Chiling",
        "user-name": "Joy",
        "user-img": "https://s3-ap-southeast-1.amazonaws.com/travnet/user1.jpg",
        "card-type": "image",
        "link": "https://s3-ap-southeast-1.amazonaws.com/travnet/3.jpg",
        "likes": "56",
        "location": "Argentina"
    };

    var json4 = {
        "description": "Chiling",
        "user-name": "Joy",
        "user-img": "https://s3-ap-southeast-1.amazonaws.com/travnet/user1.jpg",
        "card-type": "image",
        "link": "https://s3-ap-southeast-1.amazonaws.com/travnet/4.jpg",
        "likes": "64",
        "location": "Arizona, United States"
    };

    var json5 = {
        "description": "Chiling",
        "user-name": "Joy",
        "user-img": "https://s3-ap-southeast-1.amazonaws.com/travnet/user1.jpg",
        "card-type": "image",
        "link": "https://s3-ap-southeast-1.amazonaws.com/travnet/5.jpg",
        "likes": "234",
        "location": "Spain"
    };

    var jsonArray = { "cards": [json1, json2, json3, json4, json5] };
    return jsonArray;
}

module.exports = dummy;