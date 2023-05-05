const express = require("express");
const app = express();
const Minio = require('minio')
const axios = require('axios')
const fetch = (url) => import('node-fetch').then(({default: fetch}) => fetch(url));

app.use(express.json())


//SQL Connection
var mysql = require('mysql');
var mysqlconnection = mysql.createConnection({
  host     : "dfs-node-db.c6zbhfwprabi.eu-north-1.rds.amazonaws.com",
  user     : "admin",
  password : "dfsnjv123",
  port     : "3306",
  timeout  : 60000
});

mysqlconnection.connect(function(err){
  if(err){
    console.log('Database connection failed:' + err.stack);
    return;
  }
  console.log('Connected to database.');
});

// Resolving CORS Error
var cors = require('cors');
// const { default: fetch } = require("node-fetch");

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

app.listen(8000, () => {
  console.log("Application started and Listening on port 8081");
});

app.get('/', (req,res)=>{
    res.send("Hello World.")
});

app.post("/createPipeline", function (req, res) {
        
  // console.log(req.body);
  console.log(req.headers);
  console.log(req.body);
  var step = 1;
  var ip_path = req.body.imgpath;
  for(var comp of req.body.pipeline){
    console.log(comp);
    let query = 'SELECT * FROM dfs.components WHERE name = ?';
    console.log(comp['name']);
    query = mysql.format(query, [comp['name']]);
    console.log(query);
    mysqlconnection.query(query, (err,data)=>{
      if(err){
        console.log(err);
        res.send({msg:"Error"});
      }
      sendData = {
        file_name:ip_path,
        oid:req.body.oid,
        step:step
      };
      ip_path = String(req.body.oid) + '/' + String(step) + '-op.jpg' ;
      step+=1;
      console.log(data[0].url);
      console.log(sendData);
      axios.post(data[0].url, sendData)
      .then(function (response) {
        console.log("Response Recieved");
        
      })
      .catch(function (error) {
        console.log(error);
      });
      return;
    });
    setTimeout(function temp(){
      console.log("------");
    }, 5000);
  }

  res.send({msg:"Hello"});
});


