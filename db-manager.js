var method = db_manager.prototype;

function db_manager() {
    //init
    console.log("db manager initiated");
}

method.createCard = function(){
    console.log("create card function called from db manager");
}

module.exports = db_manager;