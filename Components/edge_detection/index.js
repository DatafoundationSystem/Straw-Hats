const express = require('express')
const app = express()
// const port = 8080
const port = process.env.PORT || 8080;

const host = "127.0.0.1"
app.use(express.json())
app.use(express.urlencoded({extend:true}))

app.get('/', (req, res) => {
  res.send('Hello World!')
})


app.post('/edge_detection', (req,res) => {
  console.log(req.body)
  file_name = req.body.file_name  
  const spawn = require("child_process").spawn;
  const pythonProcess = spawn('python3',["app/utility.py", file_name]);
  res.send('Edge Detection Complete')
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})