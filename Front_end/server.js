const express = require("express");
const path = require("path")
const multer = require("multer")
const Minio = require('minio')
const ejs = require('ejs')
const mysql = require("mysql")
const jwt = require('jsonwebtoken')
const cookie_parser = require('cookie-parser')

const app = express();
var cors = require('cors');

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

const port = process.env.PORT || 3000;

var mysqlconnection = mysql.createConnection({
  host:"dfs-node-db.c6zbhfwprabi.eu-north-1.rds.amazonaws.com",
  user:"admin",
  password:"dfsnjv123",
  port:"3306",
  timeout:6000
});

mysqlconnection.connect(function(err){
  if(err){
    console.log('Database connection failed:' + err.stack);
    return;
  }
  console.log('Connected to database.');
});

var minioClient = new Minio.Client({
  endPoint: '127.0.0.1',
  port: 9000,
  useSSL: false,
  accessKey: 'EitPADwoAUvkzhs6',
  secretKey: 'g82ahUIxSAhtIJeCoLWTV1YrONFpjTop'
});

app.listen(port, () => {
  console.log(`Application started and Listening on port ${port}`);
});

app.set('view engine', 'ejs');
app.use(cookie_parser())
app.use(express.static(path.join(__dirname + '/public')));
app.use(express.json())
app.use(express.urlencoded({extended:true}))


app.get('/', (req,res)=>{
  if(req.cookies['access_token']){
    try{
      jwt.verify(req.cookies['access_token'], 'SuperSecretKey');
    }catch{
      res.render('login.ejs', {msg: ""});
      return;
    }
    res.redirect('/home');  
    return;
  } 
  res.render('login.ejs', {msg: ""});
})

app.post("/", function(req,res){
  username = req.body.user.name;
  password = req.body.user.password;

  let select_query = 'SELECT * FROM ?? WHERE ?? = ?';
  let query = mysql.format(select_query, ["dfs.users", "username", username]);

  mysqlconnection.query(query, (err,data)=>{
    if(err){
      console.log(err);
      return;
    }
    // console.log(data[0]);
    if (data.length == 0){
      console.log(1);
      res.render('login.ejs', {msg: "User doesn't exists. Try again!"});
    }else{ 
      console.log(data[0]);
      // console.log(data[0].pass);
      if(data[0].pass == password){
        // set cookie
        console.log(2);
        var token = jwt.sign({username : username}, "SuperSecretKey", {expiresIn : 86400});
        console.log(token);
        
        res
        .status(200)
        .cookie("access_token" , token, {
          httpOnly:true,
        })
        .redirect('/home');
        // .send("Logged In Succesfully.");
        // .render('index.ejs');
      }else{
        console.log(3);
        res
        .status(200)
        .render('login.ejs', {msg: "Wrong password. Try again!"})
      }
    }
  });
})

app.get("/home", (req, res) => {
  console.log(req.cookies['access_token']);
  if(!req.cookies['access_token']){
    console.log("Cookie not found.")
    res.redirect('/');
  }else{
    // console.log(req.cookies['access_token']);
    try{
      decoded = jwt.verify(req.cookies['access_token'], 'SuperSecretKey');
    }catch(err){
      res.redirect('/');
    } 
    console.log(decoded.username);
    let select_query = 'SELECT * FROM ?? WHERE ?? = ?';
    let query = mysql.format(select_query, ["dfs.users", "username", decoded.username]);

    mysqlconnection.query(query, (err,data)=>{
      if(err){
        console.log(err);
        return;
      }
      // console.log(data[0]);
      if (data.length == 1){
        console.log(1);
        res.render('index.ejs');
      }else{ 
        res.redirect('/')
      }
    });
  }
  // res.redirect('/');
});

app.post("/upload", multer({storage: multer.memoryStorage()}).single("mypic"),function (req, res, next) {
        
  minioClient.putObject('uploads', req.file.originalname, req.file.buffer, function(err, etag) {
    if (err) return console.log(err);
    res.render('index.ejs');
  
    // popup.alert('Your File Uploaded');
    console.log('File uploaded successfully.');
  });
})

app.post("/postjson", function (req, res) {
        
  console.log(req.body);
  res.send("Hello")
})