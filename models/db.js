var mongoose = require('mongoose');


var msgSchema = mongoose.Schema({
 text:{
   type:String,
   required:true
 },
  password:{
   type:String,
   required:true
  },
  board:{
  type:String,
  required:true
  },
  created_on:{
   type:Date,
   default:Date.now()
  },
  bumped_on:{
   type:Date,
    default:Date.now()
  },
  reported:{
    type:Boolean,
    default:false
  },
  replies:{
    type:Array,
  },
  replycount:{
   type:Number,
    default:0
}
  
});

var Msg = module.exports = mongoose.model('Msg',msgSchema);