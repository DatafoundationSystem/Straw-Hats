const express = require("express");
const app = express();
// const popup = require('node-popup');   


app.listen(8081, () => {
  console.log("Application started and Listening on port 8081");
});

app.get('/', (req,res)=>{
    res.send("Hello World.")
})