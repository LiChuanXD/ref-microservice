const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://me:fccprojecttesting@fccurlshortener-qon03.mongodb.net/test?retryWrites=true&w=majority' ,{ 
    useNewUrlParser: true ,
    useUnifiedTopology: true
 }, (err)=>{
    if(err) console.log(err);
    console.log("Connected to 'URL' Database")
});

const urlSchema = new mongoose.Schema({
    originalURL : {type : String , required : true},
    shortURL : String
},{timestamps : true});

const Url = mongoose.model('Url' , urlSchema);

module.exports = Url