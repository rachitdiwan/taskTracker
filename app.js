//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-rachit:PBj3YuUmChSSQpmx@cluster0.ugr9h.mongodb.net/tasktracker",{
  useNewUrlParser:true,
  useUnifiedTopology:true
});

const itemSchema = new mongoose.Schema({
  name:String
});

const listSchema = new mongoose.Schema({
  name:String,
  items:[itemSchema]
});

const item = new mongoose.model('item', itemSchema);
const list = new mongoose.model('list', listSchema);

const day = date.getDate();

app.get("/", function(req, res) {
  let things = [];
  item.find(function(err,doc){
    
    res.render("list", {listTitle: day, newListItems:doc});
  });
});

app.post("/", function(req, res){
    if(req.body.listName != day){
      const section = _.upperFirst(_.lowerCase(req.body.listName));
      if(req.body.list != "add"){
        list.findOneAndUpdate({name:section},{$pull:{items:{_id:req.body.list}}},{new:true},function(err,doc){
          if(!err){
            console.log(doc);
          }
          else{
            console.log(err);
          }
        } );
      }
      else{
        const it = new item({
          name: req.body.newItem
        });
        list.findOneAndUpdate({name:section},{$push:{items:it}},{new:true},function(err,doc){
          if(!err){
            console.log(doc);
          }
          else{
            console.log(err);
          }
        });
      }
      res.redirect("/"+_.kebabCase(_.lowerCase(section)));
    }
    else if(req.body.list != "add"){
      item.deleteOne({_id:req.body.list}, function(err,doc){
        console.log(doc.deletedCount);
      });
      res.redirect("/");
    }
    else{
      const it = new item({
        name :req.body.newItem
      })
      it.save();
      res.redirect("/");
    }
});


app.get("/about", function(req, res){
  res.render("about");
});



app.get("/:section", function(req,res){
  const section =_.upperFirst(_.lowerCase(req.params.section));
  list.findOne({name:section},function(err,doc){
    if(!err){
      if(!doc){
        const it = new list({
          name:section,
          items :[]
        })
        it.save();
        res.redirect("/"+_.kebabCase(_.lowerCase(section)));
      }
      else{
        res.render("list",{listTitle:section,newListItems:doc.items});
      }
    }
  })
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
