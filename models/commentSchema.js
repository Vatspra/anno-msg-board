var mongoose = require('mongoose');

var commentSchema = mongoose.Schema({
 text:{
  type:String,
  required:true
 },
 password:{
   type:String,
   required:true
 
 },
thread_id:{
  type:String,
  required:true
},
created_on:{
  type:Date,
  default:Date.now()
  
  }
  


})

var Replies = module.exports = mongoose.model('Replies',commentSchema)