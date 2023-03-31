const express = require("express");
const path = require("path")
const multer = require("multer")
const Minio = require('minio')
const app = express();

app.set("views",path.join(__dirname,"views"))
app.set("view engine","ejs")

var storage = multer.diskStorage({
  destination: function (req, file, cb) {

      // Uploads is the Upload_folder_name
      cb(null, "uploads")
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now()+".jpg")
  }
})
     
const maxSize = 100 * 1000 * 1000;

var upload = multer({ 
  storage: storage,
  limits: { fileSize: maxSize },
  fileFilter: function (req, file, cb){
  
      // Set the filetypes, it is optional
      var filetypes = /jpeg|jpg|png/;
      var mimetype = filetypes.test(file.mimetype);

      var extname = filetypes.test(path.extname(
                  file.originalname).toLowerCase());
      
      if (mimetype && extname) {
          return cb(null, true);
      }
    
      cb("Error: File upload only supports the "
              + "following filetypes - " + filetypes);
    } 

// mypic is the name of file attribute
}).single("mypic"); 

var minioClient = new Minio.Client({
  endPoint: 'play.min.io',
  port: 9000,
  useSSL: true,
  accessKey: '9H32W3a5gYZRbwpb',
  secretKey: 'E059JkdPjJ4ToAy7cWjeV1VLylDoVYWW'
})

app.listen(3000, () => {
  console.log("Application started and Listening on port 3000");
});

app.use(express.static(__dirname));


app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.post("/upload",function (req, res, next) {
        
  // Error MiddleWare for multer file upload, so if any
  // error occurs, the image would not be uploaded!
  upload(req,res,function(err) {

      if(err) {

          // ERROR occurred (here it can be occurred due
          // to uploading image of size greater than
          // 1MB or uploading different file type)
          res.send(err)
      }
      else {

          // SUCCESS, image successfully uploaded
          res.send("Success, Image uploaded!")
      }
  })
})