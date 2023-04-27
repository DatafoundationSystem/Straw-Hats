const express = require("express");
const path = require("path")
const multer = require("multer")
const Minio = require('minio')
const mysql = require("mysql")
const app = express();

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

app.use(express.static(path.join(__dirname + '/public')));
app.use(express.json())

app.get("/", (req,res) => {
  // console.log(__dirname + "/login.html");
  res.sendFile(__dirname + "/login.html");
  // res.send("Hello")
});

app.get("/home", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.post("/upload", multer({storage: multer.memoryStorage()}).single("mypic"),function (req, res, next) {
        
  minioClient.putObject('uploads', req.file.originalname, req.file.buffer, function(err, etag) {
    if (err) return console.log(err);
    res.sendFile(__dirname + "/index.html");
  
    // popup.alert('Your File Uploaded');
    console.log('File uploaded successfully.');
  });
})

app.post("/postjson", function (req, res) {
        
  console.log(req.body);
  res.send("Hello")
})