const express = require('express')
const app = express()
// const port = 8080
const port = process.env.PORT || 8084;

const host = "127.0.0.1"
app.use(express.json())
app.use(express.urlencoded({extend:true}))

app.get('/', (req, res) => {
  res.send('Hello World!')
})


app.post('/run', (req,res) => {
  console.log(req.body)
  var ip_path = req.body.file_name  
  var op_path = String(req.body.oid) + '/' + String(req.body.step) + '-op.jpg' 
  console.log(op_path); 
  const spawn = require("child_process").spawn;
  const pythonProcess = spawn('python3',["app/utility.py", ip_path, op_path]);
  pythonProcess.stdout.pipe(process.stdout);

  res.send('Edge Detection Complete')
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})