require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const lodash = require("lodash");

const app = express();


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const mongoPassword = process.env.MONGO_PASSWORD;

mongoose.connect(`mongodb+srv://admin-vicky:${mongoPassword}@cluster0.xscbi.mongodb.net/todolistDB`, {useNewUrlParser: true});

const itemsSchema = {
    name: {
        type: String
    }
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to my todoList!!"
});

const item2 = new Item({
    name: "Hit the + button to add an item."
});

const item3 = new Item({
    name: "<-- Hit these to delete an item."
});

const defaultItem = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);


app.get("/", (req, res) => {
    
    Item.find({}, (err, foundItems) => {

        if(foundItems.length === 0){
            Item.insertMany(defaultItem, (err) => {
                if(err){
                    console.log(err);
                }else{
                    console.log("Successfully inserted the item!!");
                }
            });

            res.redirect("/");
        }else{
            res.render("list", {listTitle: "Today", newListItems: foundItems});
        }
    })
    
})

app.post('/', (req,res) => {
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if(listName === "Today"){
        item.save();
        res.redirect("/");
    }else{
        List.findOne({name: listName}, (err, foundList) => {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    }    
});

app.get("/:customListName", (req, res) => {
    const customListName = lodash.capitalize(req.params.customListName);

    List.findOne({name: customListName}, (err, foundList) => {
        if(!err){
            if(!foundList){
                 // creating a list
                const list = new List({
                    name: customListName,
                    items: defaultItem
                })
          
                list.save();
                res.redirect("/" + customListName);
            }else{
                 // rendering a list
                res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
            }
        }  
    })

    
})

app.post("/delete", (req, res) => {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today"){
        Item.findByIdAndRemove(checkedItemId, (err) => {
            if(err){
                console.log(err);
            }else{
                console.log("Successfully deleted the item!!");
                res.redirect("/");
            }
        });
    }else{
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, (err, foundList) => {
            if(!err){
                res.redirect("/" + listName);
            }
        })
    }

    
});

app.get("/work", (req,res) => {
    res.render("list", {listTitle: "Work List", newListItems: workItems});
})


app.get("/about", (req, res) => {
    res.render("about");
})

app.listen(process.env.PORT || 3000, function(){
    console.log(`Server started on port 3000`);
})