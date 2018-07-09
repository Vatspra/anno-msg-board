/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var Msg    = require('../models/db');
var bcrypt = require('bcrypt');
const saltRounds = 10;
var Replies = require('../models/commentSchema')




module.exports = function (app) {
  var ID = function () {
  // Math.random should be unique because of its seeding algorithm.
  // Convert it to base 36 (numbers + letters), and grab the first 9 characters
  // after the decimal.
  return '_' + Math.random().toString(36).substr(2, 9);
};
  
  app.route('/api/threads/:board')
  .put(function(req,res){
    console.log(req.body)
   var  thread_id = req.body.report_id;
   Msg.findById(thread_id,function(err,doc){
     if(err)console.log(err)
     if(!doc) res.send("no thread found");
     if(doc){
       doc.set({reported:true});
       doc.save(function(err,msg){
        if(err) console.log(err);
         res.send("success")
       
         })
     
     }
    
   
   })
  
  
  })
  
  
  .post(function(req,res){
    var board1 = req.params.board;
    console.log("board is")
    console.log(board1)
    var msg   = req.body.text;
    var password = req.body.delete_password;
    var thread_id = req.body.thread_id;
    bcrypt.genSalt(saltRounds, function(err, salt) {
    bcrypt.hash(password, salt, function(err, hash) {
        // Store hash in your password DB.
      var newMsg = new Msg({
      board:board1,
      text:msg,
      password:hash,
    })
      newMsg.save(function(err,doc){
     
      if(err) console.log(err)
       res.redirect('/b/'+board1)
    })
    });
});
    
  })
  
  
  .get(function(req,res){
     var reply=[];
     var reply1=[]
     var q = Msg.find({board: req.params.board}).sort({dumped_on: -1}).limit(10);
     q.exec(function(err, doc) {
     
       //console.log(doc)
       
       var new_replies =[];
       var result=[];
       console.log(doc.length)
       for(var i=0;i<doc.length;i++){
         doc[i].replycount= doc[i].replies.length;
         for(var j=0;j<doc[i].replies.length;++j){
           if(j<3){
          new_replies.push({thread_id:doc[i].replies[j].thread_id,text:doc[i].replies[j].text,reported:doc[i].replies[j].reported,
                                      created_on:doc[i].replies[j].created_on,_id:doc[i].replies[j]._id})
           }
         }
       
      doc[i].replies=new_replies;
         new_replies=[];
      result.push(doc[i])
       }
       res.json(result)
       
  
     
      });
    
    
    
    
    
  /*  Msg.find({board:req.params.board},function(err,doc){
     if(err) console.log(err);
      
      if(doc.length>0){
        console.log(doc.length)
        
      for(var i=0;i<doc.length;i++){
       //doc[i].replycount= doc[i].replies.length;
        //console.log(obj[i].replycount)
        
       delete doc[i].password;
       for(var j=0;j<doc[i].replies.length;j++){
        delete doc[i].replies[j].delete_password;
        
       }
        reply.push(doc[i])
        
       // console.log(reply)
      }
      }
      res.json(reply)
    })*/
  })
  
  .delete(function(req,res){
    console.log(req.body)
     Msg.findById(req.body.thread_id,function(err,doc){
     if(doc){
       bcrypt.compare(req.body.delete_password, doc.password, function(err, rec) {
         if(rec){
         Msg.deleteOne({_id:req.body.thread_id},function(err){
           if(err){
            console.log(err);
             res.send("can not delete,some thing went wrong")
           }
           else{
             
              res.send("deleted")
             }
          })
         }
         else{
          res.send("invalid password")
         }
        });
     }
     else if(!doc){
       res.send("invalid id")
      }
      else if(err)
      {
       res.send("some thing went wrong")
       }
      else{
       res.send("i dont know ,but some thing unexpected happened")
        }
     })
   })
  //
  
    
  app.route('/api/replies/:board')
  
  .get(function(req,res){
    var thread_id = req.query.thread_id;
    console.log("id is "+thread_id);
    console.log("GOT REQUEST")
   var reply=[]
   Msg.findOne({_id:thread_id},function(err,doc){
     
     console.log(doc)
     if(err) console.log(err);
       delete doc.password;
        for(var j=0;j<doc.replies.length;j++){
        delete doc.replies[j].delete_password;
       } 
      res.json(doc)
    })
  })
  
  
  .post(function(req,res){
   var thread_id = req.body.thread_id;
   var text = req.body.text;
   var delete_password=req.body.delete_password;
   var _id = ID();
  // var bumped_on=false;
    var reported=false
    Msg.findOne({_id:thread_id,board:req.params.board},function(err,doc){
     if(err) console.log(err);
      if(!doc) res.json({"msg":"no thread found"});
      
      else{
        var replies = doc.replies;
        var bumped_on=doc.bumped_on;
        var d = new Date();
        var replies1={
        thread_id:thread_id,
        text:text,
        delete_password:delete_password,
        _id:_id,
        reported:reported,
        created_on:d
        }
        replies.unshift(replies1);
        doc.set({replies:replies,bumped_on:d,replycount:replies.length});
        doc.save(function(err,updatedThread){
         if(err) console.log(err);
        else{
        res.redirect('/b/'+req.params.board+'/'+thread_id)
         }
        
        })
      }
    })
  })
  
  .delete(function(req,res){
    console.log(req.body);
    var ismatch = false
    Msg.findById(req.body.thread_id,function(err,doc){
     if(err){
      // console.log(err)
      }
     if(doc){
      var new_reply = doc.replies;
      for(var i=0;i<doc.replies.length;i++){
       if(doc.replies[i].delete_password==req.body.delete_password&&doc.replies[i]._id==req.body.reply_id){
        new_reply[i].text='[deleted]';
          ismatch = true;
          break
       }
      }
       if(ismatch){
       doc.replies = new_reply;
       
       Msg.findByIdAndUpdate(doc._id,doc,function(err,updatedDoc){
       if(err) console.log(err)
         res.send("deleted");
       })
      // if(!ismatch) res.send("invalid password")
      }
       if(!ismatch){
         res.send("invalid password")
       }
     }
      if(!doc){
       res.send("invalid thread id")
      }
    
    })
  
  })

};
