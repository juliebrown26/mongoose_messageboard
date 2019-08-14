// Import
const express = require("express");
const app = express();
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('express-flash');
mongoose.connect('mongodb://localhost:27017/messages', {useNewUrlParser: true});

//Config
app.use(express.static(__dirname + "/views"));
app.use(flash());
app.use(express.urlencoded({useNewUrlParser: true}));
app.use(session({
    secret: 'keepquiet',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
  }));

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
 
//Database
const CommentSchema = new mongoose.Schema({
    name: {type: String, required: [true, "Comments must have a name"]},
    content: {type: String, required: [true, "Comments must have content"]},
}, {timestamps: true})

const MessageSchema = new mongoose.Schema({
    name: {type: String, required: [true, "Messages must have a name"]},
    content: {type: String, required: [true, "Messages must have content"]},
    comments: [CommentSchema]
}, {timestamps: true})


const Message = mongoose.model('Message', MessageSchema);
const Comment = mongoose.model('Comment', CommentSchema);

//Routes
app.get('/', (req, res) => {
    console.log('welcome to the message board');
    Message.find({}, function(err, messages) {
        if(err) {
            console.log('there was an error finding messages');
            res.json({message: "There was an error", error: err} )
        }
        else {
            res.render('index', {messages}); 
        }
    });
});
app.post('/message', (req, res) => {
    console.log('new message');
    const message = new Message();
    message.name = req.body.name;
    message.content = req.body.content;
    message.save(function(err, data) {
        if (err) {
            console.log('something went wrong');
            for (var key in err.errors) {
                req.flash("messageform", err.errors[key].message);
            }
            res.redirect('/');
        }
        else {
            console.log('new message added');
            res.redirect('/');
        }
    });
});
app.post('/comment', (req, res) => {
    console.log('new comment');
    const comment = new Comment();
    comment.name = req.body.name;
    comment.content = req.body.content;
    comment.save(function(err, data) {
        if (err) {
            console.log('something went wrong');
            for (var key in err.errors) {
                req.flash("commentform", err.errors[key].message);
            }
            res.redirect('/');
        }
        else {
            console.log('adding comment');
            Message.updateOne({_id: req.body.message_id}, {$push: {comments: data}}, function(err, data) {
                if (err) {
                    console.log('something went wrong adding comment to message')
                    res.json({message: "There was an error", error: err} )
                }
                else {
                    console.log('comment successfully added');
                    res.redirect('/')
                }
            });
        };
    });
});

//Port
app.listen(8000, () => console.log("listening on port 8000"));