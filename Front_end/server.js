const express = require("express");
const path = require("path")
const multer = require("multer")
const Minio = require('minio')
const ejs = require('ejs')
const mysql = require("mysql")
const jwt = require('jsonwebtoken')
const cookie_parser = require('cookie-parser')
const axios = require('axios')


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
  accessKey: '9QKx0lFAgwt0PBqi',
  secretKey: 'vJ18iMajpBDKbuac8okG9W8b1okRFRT4'
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
        console.log(data);
        console.log(data[0].role);

        let comp_select_query = 'SELECT * FROM ??';
        let component_query = mysql.format( comp_select_query, ["dfs.components"]);
        let user_role = data[0].role;


        mysqlconnection.query(component_query, (err,data)=>{
          if(err){
            console.log(err);
            return;
          }

          let component_data = []

          for (let i = 0; i < data.length; i++) {
            // text += "The number is " + i + "<br>";
            let temp = [
              data[i].id, //cid
              data[i].name, //cname
              data[i].description //cdesc
            ]
            component_data.push(temp);
          }
          console.log(component_data);
          if( user_role == 1 ){
            const obj = {
              flag:"1",
              cdata:component_data
            };
            // res.render('index.ejs', {obj});
            var multiObj = [{flag:"1", cdata: component_data}];
            res.render('index.ejs', { mobj: multiObj } );
          }
          else{
            const obj = {
              flag:"0",
              cdata:component_data
            };
            // res.render('index.ejs', {obj});
            var multiObj = [{flag:"0", cdata: component_data}];
            res.render('index.ejs', { mobj: multiObj } );
            //res.render('index.ejs', data: {flag:"0", cdata: component_data});
          }
        });


      }else{ 
        res.redirect('/')
      }
    });

    // let comp_query = 'SELECT * FROM ?? ';
    // let comp_ret_query = mysql.formal( comp_query, [ "components" ] );
  }
  // res.redirect('/');
});


app.post("/upload", multer({storage: multer.memoryStorage()}).single("mypic"),function (req, res, next) {
  
  minioClient.putObject('uploads', req.file.originalname, req.file.buffer, function(err, etag) {
    if (err) return console.log(err);
    res.redirect('/home');
  
    // popup.alert('Your File Uploaded');
    console.log('File uploaded successfully.');
  });
})

app.post("/compUpload", multer({storage: multer.memoryStorage()}).single("inputFile"),function (req, res, next) {
  console.log("Comp Upload Req:");
  console.log( req.body.cname );
  console.log( req.body.description );    
  
  let comp_name = req.body.cname;
  let comp_desc = req.body.description;
  
  minioClient.putObject('comp-upload', req.file.originalname, req.file.buffer, function(err, etag) {
    if (err) return console.log(err);
    res.redirect('/home');
  
    console.log("=============================================")    
    // popup.alert('Your File Uploaded');
    console.log('Component Zip File uploaded successfully.');

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
      console.log("USERNAME:");
      console.log(decoded.username);
    
      console.log("FILENAME:");
      console.log( req.file.originalname )

      let select_query = 'SELECT * FROM ?? WHERE ?? = ?';
      let uid_query = mysql.format(select_query, ["dfs.users", "username", decoded.username]);

      mysqlconnection.query(uid_query, (err,data)=>{
        if(err){
          console.log(err);
          return;
        }
        // console.log(data[0]);
        if (data.length == 1){
          console.log("user_id");
          console.log(data[0].user_id);
          let uid = data[0].user_id;

          let url_temp = "url";
          let insert_query = 'INSERT INTO ?? ( name, url, user_id, description, object_name ) VALUES( ?, ?, ?, ?, ? )';
          let comp_query = mysql.format(insert_query, ["dfs.components", comp_name, url_temp, uid, comp_desc, req.file.originalname ]);

          console.log( "COMP QUERY:" )
          console.log( comp_query );

          mysqlconnection.query( comp_query, (err,data)=>{
            if(err){
              console.log(err);
              return;
            }
            // console.log(data[0]);
            console.log( "Component updated in Database successfully !!" );


            // Sending data to node manager =========================================
            sendData = {
              "object_name": req.file.originalname,
              "c_name" : comp_name,
              "c_desc" : comp_desc,
              "user_id": uid
            }
      
            axios.post('http://127.0.0.1:8085/deploy', sendData)
            .then(function (response) {
              console.log(response);
            })
            .catch(function (error) {
              console.log(error);
            });


            // SEND data to index.js ============================================
            let select_query2 = 'SELECT * FROM ?? WHERE ?? = ?';
            let cid_query = mysql.format(select_query, ["dfs.components", "name", comp_name]);
            mysqlconnection.query(cid_query, (err,data)=>{
              if(err){
                console.log(err);
                return;
              }
              console.log( "CID: " )
              console.log( data[0].id );
              //res.render('index.ejs', {flag:"1"});
              res.render('/home');
            });
            

          });

        }else{ 
          res.redirect('/')
        }
      });

      
    }

    
  });
})



app.post("/postjson", function (req, res) {
        
  console.log(req.body);
  res.send("Hello")
})