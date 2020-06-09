const mongoose = require('mongoose');

mongoose.connect('' , {
    useNewUrlParser : true,
    useUnifiedTopology : true
} , (err)=>{
        if(err){
            console.log(err)
        }
        console.log('Connected to "EXERCISE TRACKER" Database')
});



const userSchema = new mongoose.Schema({
    userName : {type : String , unique : true , required : true , max : [12 , "Username too long"]},
    userId : {type : String , unique : true , required : true},
    userLog : [
        {
            description : {type : String},
            duration : {type : Number},
            date : {type : Date, default : Date.now}
        }
    ]
} , {timestamps : true});

const User = mongoose.model("User" , userSchema);

module.exports = User;