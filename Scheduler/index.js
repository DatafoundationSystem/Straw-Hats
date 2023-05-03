const express = require("express");
const app = express();
const Minio = require('minio')
const axios = require('axios')
const fetch = (url) => import('node-fetch').then(({default: fetch}) => fetch(url));

app.use(express.json())


//SQL Connection
var mysql = require('mysql');
var connection = mysql.createConnection({
  host     : "dfs-node-db.c6zbhfwprabi.eu-north-1.rds.amazonaws.com",
  user     : "admin",
  password : "dfsnjv123",
  port     : "3306",
  timeout  : 60000
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

app.listen(8081, () => {
  console.log("Application started and Listening on port 8081");
});

app.get('/', (req,res)=>{
    res.send("Hello World.")
});

app.post("/postjson", function (req, res) {
        
  console.log(req.body);

  connection.connect(function(err) {
    if (err) {
      console.error('Database connection failed: ' + err.stack);
      return;
    }
  
    console.log('Connected to database.');
  
    connection.query('SELECT * FROM dfs.components WHERE user_id = "1";', function(err,result,fields){
      if(err)console.log(err);
      if(result)
  
      for(let i=0;i<result.length;i++){
        // component_name = result[i]["name"]
        console.log(result[i]["name"]);
        
      
      
          component_name = result[i]["name"]
          
          if(component_name=="Edge Detection"){
            sendData = {
              file_name : "img1.png"
            }
      
            axios.post('http://127.0.0.1:8080/edge_detection', sendData)
            .then(function (response) {
              console.log(response);
            })
            .catch(function (error) {
              console.log(error);
            });
          }
          
      }
  
    });
  
  
    connection.end();
  });
  




  res.send("Hello")
});


