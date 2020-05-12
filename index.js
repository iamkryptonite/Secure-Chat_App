var express = require('express'),
    app     = express(),
    socket  = require('socket.io'),
    bodyParser = require('body-parser'),
    mongoose= require('mongoose'),
    passport= require('passport'),
    LocalStrategy = require('passport-local');

var User    = require('./models/user'),
    Message = require('./models/message');
    
        

//'mongodb+srv://kryptonite:9433790689@cluster0-hxqma.mongodb.net/test?retryWrites=true&w=majority'
//=============================================================================================================    
var db=process.env.MONGODB_URL;
mongoose.connect(db,{useUnifiedTopology:true,useNewUrlParser:true });
mongoose.connection.once('open',()=>{
    console.log("database connected");
    User.find({},function(err,users){
        users.forEach(user=>{
            usernames.push(user.username);
        })       
    });
});
//process.env.PORT,process.env.IP
var server = app.listen(process.env.PORT,process.env.IP,function(){
    console.log("server is live");
});

var currentUser;
var io =socket(server);
var usernames=[];

app.set("view engine","ejs");
app.use('/public',express.static('public'));
app.use(bodyParser());
//===========================================================================================
app.use(require('express-session')({
    secret:"carolebaskin",
    resave:false,
    saveUnintialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//==============================================================================================




io.on('connection', (socket) => {
    console.log('made socket connection', socket.id);
           
    socket.on('chat', function(data){
        var dest = data.handle;
        dest = dest.substr(1,dest.length);
        var destarray;
        if(dest==""){
            destarray=usernames;            
        }else{
            destarray=dest.split("@");
        }
        // destarray.push(currentUser.username);
        var msg = {
            message: data.message,
            destination:destarray,
            author:currentUser.username
        };
        var message = new Message(msg);
        message.save(function(err,msg){
            if(err)
            {
                console.log(err);
                return res.redirect('/login');
            }
            // console.log(msg);
        })
        io.sockets.emit('chat', msg);
    });
    
    socket.on('typing', function(data){
        socket.broadcast.emit('typing', data);
    });
});


app.get("/",isLoggedIn,function(req,res){
    currentUser=req.user;
    // console.log(req.user);
    Message.find({},function(err,messages){
        if(err){
            console.log(err);
            return res.redirect('/login');
        }
        res.render('chat',{usernames:usernames,currentUser:currentUser.username,messages:messages});
    })   
       
});

//=======================AUTHENTICATION ROUTES==============================================
app.get("/login",function(req,res){
    res.render('login');
})
app.post("/login",passport.authenticate("local",{
    successRedirect:'/',
    failureRedirect:'/login'
}));
app.get("/signup",function(req,res){
    res.render('signup');
});
app.post("/signup",function(req,res){
    var newUser = new User({
        username:req.body.username,
        email:req.body.email,
    });
    User.register(newUser,req.body.password,function(err,user){
        if(err){
            console.log(err);
            return res.redirect('/signup');
        }
        passport.authenticate('local')(req,res,function(){
            res.redirect('/');
        })
    })
});
app.get('/logout',function(req,res){
    req.logout();
    res.redirect('/login');
})

function isLoggedIn(req,res,next){
    if(req.isAuthenticated())
    next();
    else
    res.redirect('/login');
}