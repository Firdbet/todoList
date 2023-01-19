
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
var _ = require('lodash');

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.set('strictQuery', true);
mongoose.connect("mongodb+srv://firdbet:firdbet123@cluster0.zrjxdpx.mongodb.net/todolist");

const itemSchema = new mongoose.Schema({
   name: String
});

const workSchema = new mongoose.Schema({
   name: String,
   item: [itemSchema]
});

const Item = mongoose.model("Item", itemSchema);
const Work = mongoose.model("Work", workSchema);

const item1 = new Item ({
   name: "Welcome to todoList"
});

const item2 = new Item ({
   name: "<--click this to delete"
});

const item3 = new Item ({
   name: "Add new item below"
});

const defaultItem = [item1, item2, item3];

app.get("/", function(req, res){
   Item.find({}, function(err, foundItem){
     if(foundItem.length === 0) {
      Item.insertMany(defaultItem, (err)=>{
         if(err) {
            console.log(err);
         } else {
            console.log("success");
         }
        });
        res.redirect("/");
     } else {
        res.render("list", {listTitle: "Today", newListItem: foundItem});
     }
   });

});

app.get("/:custemTitle", function(req, res){
   let custemTitle = _.capitalize(req.params.custemTitle);
   const list = new Work ({
      name: custemTitle,
      item: defaultItem
   })
   Work.findOne({name: custemTitle}, function(err, foundList){
      if(!err) {
         if(!foundList) {
            list.save();
            res.redirect("/" + custemTitle);
         } else {
             res.render("list", {listTitle: foundList.name, newListItem: foundList.item});
         }
      }
   
   })
  
});

app.post("/", function(req, res) {
   const title =req.body.list;
   const items = req.body.newItem;
   const item = new Item ({
      name: items
   });
   if(title === "Today") {
     item.save();
      res.redirect("/"); 
   } else {
    Work.findOne({name: title}, function(err, foundList){
     foundList.item.push(item);
     foundList.save();
      res.redirect("/" + title);
    });
   }
});

app.post("/delete", function(req, res) {
   const deleted = req.body.checkedItem;
   const hiddenList = req.body.hiddenName;

  if(hiddenList === "Today") {
       Item.findByIdAndRemove(deleted, function(err) {
      if(err) {
         console.log(err);
      }
    });
   res.redirect("/"); 
  } else {
   Work.findOneAndUpdate({name: hiddenList}, {$pull: {item: {_id: deleted}}}, function(err, result){
      if(!err) {
         res.redirect("/" + hiddenList);
      }
   });
  }

});

app.listen(process.env.POST || 3000, function(){
    console.log("Server is on port 3000.");
});
