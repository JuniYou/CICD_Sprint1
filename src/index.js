import express from "express";

const port = process.env.PORT || 80;
const app = express();
 app.get('/', (req, res)=>{
    console.log("get function 23");
    res.send("<h1 style='color: red;'>Hello from 2 shaked</h1>");
 }
 );

 app.listen(port, ()=>{
    console.log("listen to port " + port);
 })