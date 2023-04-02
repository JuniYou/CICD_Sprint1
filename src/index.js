import express from 'express';

const port = process.env.PORT || 80;
const app = express();
app.use(express.json());

app.get('/', (req, res) => {
   res.sendFile('page/index.html', { root: './' });
});

app.get('/Login', (req, res) => {
   res.sendFile('page/login.html', { root: './' });
});

app.get('/getstyle', (req, res) => {
   res.sendFile('style/style.css', { root: './' });
});

app.get('/getscripts', (req, res) => {
   res.sendFile('scripts/scripts.js', { root: './' });
});

app.post('/process_post_req', (req, res) => {
   // Get the JSON data from the request
   const data = req.body;
   
  // var web_data = JSON.parse(data);
   var web_data = data;

   const type = web_data.action;

   //If its a if(true) then we can send the POST reuest
   if((type !== undefined) && (type === 'process_login') && (web_data.password) !== undefined && (web_data.username) !== undefined)
   {
       const obj = '{"response": "'+web_data.username+'"}';
       res.send(obj);
   }
   
 });

app.listen(port, () => {
   console.log(`listen to port ${port}`);
});
