const mongoose = require('mongoose');
const passportlocalMongoose = require('passport-local-mongoose')
const Schema = mongoose.Schema;
const userSchema = new Schema({
    username:String,
    email:String,
    password:String    
});
userSchema.plugin(passportlocalMongoose);
module.exports= mongoose.model('User',userSchema);