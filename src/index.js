import express from "express";

const port = process.env.PORT || 80;
const app = express();


 app.get('/', (req, res)=>{

    res.sendFile('page/index.html', { root: "./"})
 }
 );

 app.get('/Login', (req, res)=>{

    res.sendFile('page/login.html', { root: "./"})
 }
 );

 app.get('/getstyle', (req, res)=>{

   res.sendFile('style/style.css', { root: "./"})
}
);

app.get('/getscripts', (req, res)=>{

   res.sendFile('scripts/scripts.js', { root: "./"})
}
); 

 app.listen(port, ()=>{
    console.log("listen to port " + port);
 })