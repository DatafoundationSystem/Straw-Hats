const express = require("express");
const path = require("path")
const multer = require("multer")
const Minio = require('minio')
const app = express();

app.set("views",path.join(__dirname,"views"))
app.set("view engine","ejs")

var minioClient = new Minio.Client({
  endPoint: '127.0.0.1',
  port: 9000,
  useSSL: false,
  accessKey: 'EitPADwoAUvkzhs6',
  secretKey: 'g82ahUIxSAhtIJeCoLWTV1YrONFpjTop'
});

app.listen(3000, () => {
  console.log("Application started and Listening on port 3000");
});

app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.post("/upload", multer({storage: multer.memoryStorage()}).single("mypic"),function (req, res, next) {
        
  minioClient.putObject('uploads', req.file.originalname, req.file.buffer, function(err, etag) {
    if (err) return console.log(err)
    console.log('File uploaded successfully.')
  });
})