const express = require("express");
const path = require("path")
const multer = require("multer")
const Minio = require('minio')
const ejs = require('ejs')
const mysql = require("mysql")
const jwt = require('jsonwebtoken')
const axios = require('axios')
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
  accessKey: 'RzRZkFomebQ1QHLU',
  secretKey: 'm2593hGdtyAHRdmqcTu8erPUf2wSn0bx'
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
        var token = jwt.sign({username : username, userid:data[0].user_id}, "SuperSecretKey", {expiresIn : 86400});
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
        console.log(data);
        console.log(data[0].role);
        if( data[0].role == 1 ){
          res.render('index.ejs', { flag : "1" });
        }
        else{
          res.render('index.ejs', { flag : "0" });
        }
      }else{ 
        res.redirect('/')
      }
    });
  }
  // res.redirect('/');
});


app.post("/upload", multer({storage: multer.memoryStorage()}).single("mypic"),function (req, res, next) {
  console.log(req.file);
  try{
    decoded = jwt.verify(req.cookies['access_token'], 'SuperSecretKey');
  }catch(err){
    res.redirect('/');
  } 
  console.log(decoded);
  let query = 'SELECT * FROM dfs.operation ORDER BY id DESC';
  mysqlconnection.query(query, (err,data)=>{
    if(err){
      console.log(err);
      res.send("Error uploading image.");
    }
    console.log(data[0]);
    var oid = data[0].id+1;
    var uid = decoded.userid;
    var imgpath = String(oid) + '/' + req.file.originalname;
    let insert_query = 'INSERT INTO dfs.operation(id,user_id,component_id,step,input,output)VALUES(?,?,0,0,?,?)';
    insert_query = mysql.format(insert_query, [oid,uid,imgpath,imgpath]);
    console.log(insert_query);
    mysqlconnection.query(insert_query, (err,data)=>{
      if(err){
        console.log(err);
        res.send("Error uploading image");
      }
      minioClient.putObject('uploads', imgpath, req.file.buffer, function(err, etag) {
        if (err) return console.log(err);
        res.redirect('/home');
      
        // popup.alert('Your File Uploaded');
        console.log('File uploaded successfully.');
        console.log(etag);
      });
    });
    
  });
  
});

app.post("/postjson", function (req, res) {
  try{
    decoded = jwt.verify(req.cookies['access_token'], 'SuperSecretKey');
  }catch(err){
    res.redirect('/');
  } 
  console.log(decoded);
  let query = 'SELECT * FROM dfs.operation WHERE user_id = ? ORDER BY id DESC';
  query = mysql.format(query, [decoded.userid]);
  console.log(query);
  mysqlconnection.query(query, (err,data)=>{
    if(err){
      console.log(err);
      res.send("Error sending pipeline.");
    }
    console.log(req.body);
    var imgpath = String(data[0].id) + '/' + req.body.image;
    console.log(data[0]);
    sendData = {
      oid : data[0].id,
      user_id: data[0].id,
      imgpath: imgpath,
      pipeline: req.body.items
    };
    axios.post('http://127.0.0.1:8081/createPipeline',sendData)
    .then((res => console.log("response recieved")))
    .catch(err => console.log(err));
  });

  res.send({msg:"Hello"});
});