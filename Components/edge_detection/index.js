const express = require('express')
const app = express()
const port = 8080



app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/preprocess', (req,res) => {
  const spawn = require("child_process").spawn;
  const pythonProcess = spawn('python',["app/utility.py", "test.jpg"]);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})