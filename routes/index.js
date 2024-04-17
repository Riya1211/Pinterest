var express = require('express');
var router = express.Router();
const userModel = require('./users');
const postModel = require('./post');
const passport = require('passport');
const localStrategy = require('passport-local');
passport.use(new localStrategy(userModel.authenticate()));
const upload = require('./multer');
const post = require('./post');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index',{nav: false});
});

// GET Add
router.get('/add', isLoggedIn, async function(req, res) {
  const user = await userModel.findOne({username: req.session.passport.user});
  res.render('add', {user, nav: true});
});

// POST Create Post
router.post('/createPost', isLoggedIn, upload.single("postImage"), async function(req, res) {
  const user = await userModel.findOne({username: req.session.passport.user});
  const post = await postModel.create({
    user: user._id,
    title: req.body.title,
    description: req.body.desc,
    image: req.file.filename,
  });

  user.posts.push(post._id);
  await user.save();
  res.redirect('/profile');
});

// GET all Pins
router.get('/show/posts', isLoggedIn, async function(req, res) {
  const user = 
  await userModel
        .findOne({username: req.session.passport.user})
        .populate('posts');
  res.render('show', {user, nav: true});
});

// GET all FEEDS
router.get('/feed', isLoggedIn, async function(req, res) {
  const user = await userModel.findOne({username: req.session.passport.user});
  const posts = await postModel.find().populate('user');
  console.log(posts);
  res.render('feed', {posts, user, nav: true});
});

// GET Profile
router.get('/profile', isLoggedIn, async function(req, res) {
  const user = 
  await userModel
        .findOne({username: req.session.passport.user})
        .populate('posts');
  res.render('profile', {user, nav: true});
});

// POST File Upload
router.post('/fileUpload', isLoggedIn, upload.single('image'), async function(req, res) {
  const user = await userModel.findOne({username: req.session.passport.user});
  user.profileImage = req.file.filename;
  await user.save();
  res.redirect('/profile');
});

// GET REGISTER
router.get('/register', function(req, res) {
  res.render('register',{nav: false});
});

// POST REGISTER for form
router.post('/register', function(req, res) {
  const data = new userModel({
    username: req.body.username,
    name: req.body.fullname,
    email: req.body.email,
    contact: req.body.contact,
  })

  userModel.register(data, req.body.password).then(function(){
    passport.authenticate('local')(req, res, function(){
      res.redirect("/profile");
    })
  })
});

// login
router.post('/login', passport.authenticate('local' ,{
  failureRedirect: '/',
  successRedirect: '/profile'
}), function(req, res) { });

// logout

router.get('/logout', function(req,res, next){
  req.logout(function(err){
    if (err) { return next(err); }
    res.redirect('/');
  })
})

// loggedIn
function isLoggedIn(req, res, next){
  if(req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

module.exports = router;
