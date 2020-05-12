const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const messageSchema = new Schema({
    author:String,
    message:String,
    destination:[String],    
});
module.exports= mongoose.model('Message',messageSchema);