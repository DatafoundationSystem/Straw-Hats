
const express = require("express");
const app = express();
const Minio = require('minio')
var mysql = require('mysql')
const fs = require('fs')
const decompress = require("decompress");

app.use(express.json())

// My sql conection
var connection = mysql.createConnection({
  host     : "dfs-node-db.c6zbhfwprabi.eu-north-1.rds.amazonaws.com",
  user     : "admin",
  password : "dfsnjv123",
  port     : "3306",
  timeout  : 60000
});


// MinIO client creation
var minioClient = new Minio.Client({
  endPoint: '127.0.0.1',
  port: 9000,
  useSSL: false,
  accessKey: '9QKx0lFAgwt0PBqi',
  secretKey: 'vJ18iMajpBDKbuac8okG9W8b1okRFRT4'
});


app.get('/', (req,res)=>{
  res.send("Hello World.")
});

app.post('/deploy', (req,res)=>{
    // Json recieved from UI manager
    console.log(req.body);
    temp = req.body;

    component_file_name = temp['object_name']
    component_name = temp['c_name']
    component_desc = temp['c_desc']
    user_id = temp['user_id']

    comp_folder = component_name.split(".");

    var size = 0

    // Component Zip file downloaded from minio
    minioClient.fGetObject('comp-upload', component_file_name, component_file_name, function(err) {
    if (err) {
      return console.log(err);
    }
      console.log('success');
    })


    // Index Zip file downloaded from minio
    minioClient.fGetObject('comp-upload', "index.zip", "index.zip", function(err) {
      if (err) {
        return console.log(err);
      }
        console.log('success');
      })

    
    let destination = "../Components/"

    //Decompressing the zip files
    setTimeout(function() {
        decompress(component_file_name, destination)
        .then((files) => {
          console.log(files);
        })
        .catch((error) => {
          console.log(error);
        });    

        let temp = destination.concat(comp_folder[0])
        decompress("index.zip", temp)
        .then((files) => {
          console.log(files);
        })
        .catch((error) => {
          console.log(error);
        });    

      }, 3000);


    // npm install command running inside the component  
    setTimeout(function() {  
      let temp = destination.concat(comp_folder[0])
      const spawn = require('child_process').spawn;

        spawn('npm', ['install'], {
          cwd: temp,        // <--- 
          shell: true,
          stdio: 'inherit'
        });

      }, 6000);    
    

    // Deploying the components  
    setTimeout(function() {
      temp = destination.concat(comp_folder[0])
      runner_dest = temp.concat('/index.js')
      require('child_process').fork(runner_dest);    
    }, 20000);
    
    res.send("Hello World.")

});


app.listen(8085, () => {
  console.log("Application started and Listening on port 8085");
});