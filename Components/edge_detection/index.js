const express = require('express')
const app = express()
// const port = 8080
const port = process.env.PORT || 8080;

const host = "0.0.0.0"



app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/preprocess', (req,res) => {
  const spawn = require("child_process").spawn;
  const pythonProcess = spawn('python',["app/utility.py", "test.jpg"]);
  res.send('Edge Detection Complete')
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})