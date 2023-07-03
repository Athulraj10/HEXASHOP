const mongoose = require('mongoose');


// const localURI = 'mongodb://127.0.0.1:27017/Ecommerce';
const localURI = '';
const clusterURI = 'mongodb+srv://HEXASHOP:Hexa117700@cluster0.r6zdvci.mongodb.net/HEXASHOP?retryWrites=true&w=majority';
// const clusterURI=""
let URI = localURI;
if (process.env.NODE_ENV !== 'localhost' && clusterURI) {
  URI = clusterURI;
}

console.log('MongoDB URI:',URI);

mongoose
  .connect(URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Successfully connected to the database');
  })
  .catch((error) => {
    console.log('Error connecting to the database:', error);
  });

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
    saveUninitialized: false,
    store // or true, depending on your use case
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