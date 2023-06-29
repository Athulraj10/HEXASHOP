const mongoose=require('mongoose')
mongoose.connect('mongodb://127.0.0.1:27017/Ecommerce')

require('dotenv').config()
const express= require("express")
const app=express();

var path=require('path')
const config=require('./config/config')
const bodyParser = require("body-parser");
const session = require('express-session');
const nocache=require('nocache')
const flash = require('express-flash');

const MongoDBStore = require('connect-mongodb-session')(session);

const store = new MongoDBStore({
  uri: 'mongodb://127.0.0.1:27017/Ecommerce',
  collection: 'sessions'
});


app.use(session({
    secret: config.sessionSecret,
    resave: false, // or true, depending on your use case
    saveUninitialized: false, // or true, depending on your use case
    store,
  }));

app.use(nocache())
app.use(flash())

app.set('view engine','ejs')
app.set('views',"./views")
app.use(express.static(path.join(__dirname,'public')))
app.use(express.static("public"));


const userRoute=require('./routes/userRoute')
app.use('/',userRoute);

const AdminRoute=require('./routes/AdminRoute')
app.use('/admin',AdminRoute);

app.use('*',function(req,res){
  res.render('404.ejs')
})

const PORT=process.env.PORT||3000
app.listen(PORT,()=>{
    console.log(`server is running in ${PORT}`)
})