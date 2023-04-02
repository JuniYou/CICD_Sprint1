import express from 'express';

const app = express();
// Use the built-in middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Handle POST requests
app.post('/', (req, res) => {
    // Get the JSON data from the request
    const data = req.body;
    var web_data = JSON.parse(data);
    const type = web_data.find(action);

    //If its a if(true) then we can send the POST reuest
    if((type !== undefined) && (type === 'process_login') && (web_data.find('password') !== undefined) && (web_data.find('username') !== undefined))
    {
        const obj = {response: username.value};
        app.send(JSON.stringify(obj));
    }
    // Send a response
    res.send('Data received!');
  });
  