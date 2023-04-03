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

app.post('/process_post_req', (req, res) => {
   try {
      // Get the JSON data from the request
      const data = req.body;
      const webData = data;
      const type = webData.action;

      // If it's a true statement, then we can send the POST request
      if (type !== undefined && type === 'process_login' && webData.password !== undefined && webData.username !== undefined) {
         const obj = `{"response": "${webData.username}"}`;
         res.send(obj);
      }
   } catch (err) {
      console.error(err);
   }
});

app.listen(port, () => {
   console.log(`Listening on port ${port}`);
});
