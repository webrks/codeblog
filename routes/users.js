var mongoose = require('mongoose');
var plm = require('passport-local-mongoose');

mongoose.connect('mongodb+srv://rk123:12qaz12wsx@cluster0.wjxko.mongodb.net/myFirstDatabase?retryWrites=true&w=majority');  

var userSchema = mongoose.Schema ({
    name : String ,
    username : String ,
    profileImage: {
        type: String,  
        default: './images/Uploads/defaut.jpg' 
    },
    posts: [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'posts'
    }], 
    email : String ,
    password : String
})

userSchema.plugin(plm);
module.exports = mongoose.model('users' , userSchema);