var express = require('express');
var router = express.Router();
const userModel = require('./users');
const passport = require('passport');
const localStrategy = require('passport-local');
const multer = require('multer');

const postModel = require('./posts');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/Uploads')
  },
  filename: function (req, file, cb) {
    var date= new Date();
    var filename = date.getTime()+ file.originalname;
    cb(null, filename);
  }
})
 
var upload = multer({ storage: storage })


passport.use(new localStrategy(userModel.authenticate()));

/* GET home page. */
router.get('/', function(req, res) {
  if(req.isAuthenticated()){
    postModel.findRandom({}, {}, {limit: 3, populate: 'author' }, function(err, results) {
      if (!err) {
        res.render('index' , {tittle: 'Bloggy' , loggedIn: true, results: results} );
      }
    });
    
  }
  else{
    postModel.findRandom({}, {}, {limit: 3, populate: 'author' }, function(err, results) {
      if (!err) {
        res.render('index' , {tittle: 'Bloggy' , loggedIn: false, results: results} );
      }
    });
  }
  });

router.get('/login' , function(req,res){
  
  res.render('login');
})

router.get('/register' , function(req,res){
  res.render('register')
})
router.get('/profile' , isLoggedIn, function(req, res){
  userModel.findOne({username: req.session.passport.user}).populate('posts')
  .exec(function(err,data){
    res.render('profile' , { details: data});
  })
})

router.get('/update/:username' , isLoggedIn, function(req, res){
  userModel.findOne({username: req.params.username})
  .then( function(foundUser){
   res.render('update' , {details: foundUser});
  })
});


router.get('/logout', function(req, res){
  req.logOut();
  res.redirect('/')
})

router.get('/blogs' , function(req, res){
   postModel.find()
   .then(function(userFound){
     res.send(userFound)
   })
})

router.get('/recent' , function(req, res){
  if(req.isAuthenticated()){
    postModel.findRandom({}, {}, {limit: 3, populate: 'author' }, function(err, results) {
      if (!err) {
        res.render('recent' , {tittle: 'Bloggy' , loggedIn: true, results: results} );
      }
    });
    
  }
  else{
    postModel.find({}, {}, {limit: 3, populate: 'author' }, function(err, results) {
      if (!err) {
        res.render('recent' , {tittle: 'Bloggy' , loggedIn: false, results: results} );
      }
    });
  }
  });
 

router.get('/randomposts' ,function(req , res){
  postModel.findRandom({}, {}, {limit: 3, populate: 'author' }, function(err, results) {
    if (!err) {
      res.send(results); // 10 elements, name only, in genres "adventure" and "point-and-click"
    }
  });
})

router.get('/like/:id' , isLoggedIn, function(req, res){
  userModel.findOne({username: req.params.username})
  .then(function(loggedInUser){
    postModel.findOne({_id: req.params.id })
    .then(function(postFound){
      postFound.like.push(loggedInUser)
      postFound.save()
      .then(function(founded){
        req.flash('info', 'like added')
        res.redirect('/')
      })
    })
  })
})


 router.post('/update' , function(req , res){
   userModel.findOneAndUpdate({username: req.session.passport.user}, {
     name: req.body.name,
     username: req.body.username, 
     email: req.body.email
   })
   .then(function(updatedUser){
     res.redirect('/profile')
   })
 })
router.post('/register', function(req , res){
  var userData = new userModel({
    username : req.body.username,
    name : req.body.name,
    email : req.body.email
  })
  userModel.register(userData , req.body.password)
  .then(function(registeresUser){
    passport.authenticate('local')(req, res , function(){
      res.redirect('/profile' );
    })
  })
})


router.post('/upload' ,upload.single('image'), function(req, res){
    
    userModel.findOne({username: req.session.passport.user})
    .then(function(foundUser){
      foundUser.profileImage = `./images/Uploads/${req.file.filename}`;
      foundUser.save()
      .then(function(){
        req.flash('status' , 'image succsessfully  Uploaded')
        res.redirect('/profile');
      })
    })
    
})
router.post('/login', passport.authenticate('local', {
  successRedirect : '/profile',
  failureRedirect: '/'
}), function(req, res ){
  
})


router.post('/postblog' , function(req, res){
  userModel.findOne({username: req.session.passport.user})
   .then(function(foundUser){
     postModel.create({
       author: foundUser._id,
       post: req.body.post
     })
     .then(function(createdPost){
       foundUser.posts.push(createdPost)
       foundUser.save()
       .then(function(){
         res.redirect('/profile')
       })
     })
   })
})

function isLoggedIn(req, res , next){
  if (req.isAuthenticated()){
    return next();
  }
  else{
    req.flash('error' , 'You Need To Login First !')
    res.redirect('/login')
  }
}
module.exports = router;  
