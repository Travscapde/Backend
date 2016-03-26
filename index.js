var express = require("express");
var app = express();

//Creating Router() object

var router = express.Router();

// Router middleware, mentioned it before defining routes.
router.use(function(req, res, next) {
    console.log("/" + req.method);
    next();
});
// Provide all routes here, this is for Home page.

router.get("/about", function(req, res) {
    res.json({ "message": "Welcome to TravnetDiscover Backend!" });
    //routeHandlerInstance.handleAbout(req, res);
});

router.get("/getImages", function(req, res) {
    console.log("getImages request received");
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

    res.json({ "image": imgs });
    console.log("getImages Handled");
});

router.get("/getImage", function(req, res) {
    console.log("getImage request received")
    var imgs = ["https://s3-ap-southeast-1.amazonaws.com/travnet/1.jpg"];
    res.json({ "image": imgs });
    console.log("getImage Handled");
});

// Handle 404 error. 
// The last middleware.
//app.use("*",function(req,res){
//res.status(404).send('404');
//});

// Tell express to use this router with /api before.
// You can put just '/' if you don't want any sub path before routes.

app.use("/api", router);

// Listen to this Port

app.listen(8080, function() {
    console.log("Live at Port 8080");
});