const express = require("express");
const app = express();
const Minio = require('minio')
var mysql = require('mysql')
const decompress = require("decompress");

app.use(express.json())

// MY sql conection
var connection = mysql.createConnection({
  host     : "dfs-node-db.c6zbhfwprabi.eu-north-1.rds.amazonaws.com",
  user     : "admin",
  password : "dfsnjv123",
  port     : "3306",
  timeout  : 60000
});

var minioClient = new Minio.Client({
  endPoint: '127.0.0.1',
  port: 9000,
  useSSL: false,
  accessKey: 'EitPADwoAUvkzhs6',
  secretKey: 'g82ahUIxSAhtIJeCoLWTV1YrONFpjTop'
});


app.get('/', (req,res)=>{
  res.send("Hello World.")
});

//note .zip file should have folder with same name

app.post('/deploy', (req,res)=>{
    console.log(req.body);
    temp = req.body;

    component_file_name = temp['object_name']
    component_name = temp['c_name']
    component_desc = temp['c_desc']
    user_id = temp['user_id']

    comp_folder = component_name.split(".");

    var size = 0

    minioClient.fGetObject('uploads', component_file_name, component_file_name, function(err) {
    if (err) {
      return console.log(err);
    }
      console.log('success');
    })
    
    let destination = "../Components/"

    setTimeout(function() {
        decompress(component_file_name, destination)
        .then((files) => {
          console.log(files);
        })
        .catch((error) => {
          console.log(error);
        });    
  }, 3000);

    
    
  setTimeout(function() {
    temp = destination.concat(comp_folder[0])
    runner_dest = temp.concat('/index.js')
    require('child_process').fork(runner_dest);    
}, 5000);
  
    res.send("Hello World.")

});


app.listen(8085, () => {
  console.log("Application started and Listening on port 8085");
});