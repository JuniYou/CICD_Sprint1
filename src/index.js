import express from 'express';
import pkg from 'pg';
const {Client} = pkg;
import session from 'express-session';
import cookieParser from 'cookie-parser';
var session1;

const client = new Client({
  user: 'shakeda',
  host: 'dpg-cgugbmg2qv2fdedbo640-a.frankfurt-postgres.render.com',
  database: 'juniyoudb',
  password: 'puMtqvjlq7ftkPfuvHwZFKUuZ5tlWQiV',
  port: 5432,
  ssl: true
});

client.connect();
const port = process.env.PORT || 80;
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(session({
   secret: "asdfkml5rtythytt6onjghfojfdpflhplp9trd7htru5u4969u",
   saveUninitialized: false,
   resave: false
}));



function clean(str)
{
   for(var i=0; i < str.length ; i++)
   {
      if (str[i]<'a' || str[i]>'z')
      {
         if (str[i]<'A' || str[i]>'Z')
         {
            if (str[i]<'0' || str[i]>'9')
            {
               if(str[i]!= '@' && str[i]!= '.')
               {
                  return false;
               }
            }
         }
      }
   }
   return true;
}
function clean_fullname(str)
{
   for(var i=0; i < str.length ; i++)
   {
      if (str[i]<'a' || str[i]>'z')
      {
         if (str[i]<'A' || str[i]>'Z')
         {
            if (str[i]<'0' || str[i]>'9')
            {
               if(str[i]!= '@' && str[i]!= '.')
               {
                  if(str[i] == ' ' && str.indexOf(' ') == str.lastIndexOf(' '))
                  {
                     continue;
                  }
                  else
                  {
                     return false;
                  }
               }
            }
         }
      }
   }
   return true;
}
app.get('/', (req, res) => {
   res.sendFile('page/index.html', { root: './' });
});

app.get('/Login', (req, res) => {
   res.sendFile('page/login.html', { root: './' });
});

app.get('/getstyle', (req, res) => {
   res.sendFile('style/style.css', { root: './' });
});

app.get('/Register', (req, res) => {
   res.sendFile('page/register.html', { root: './' });
});


app.get('/Account', (req, res) => {
   
   
   if(req.session.username !== undefined)
   {
      console.log("5");
      res.sendFile('page/account.html', { root: './' });
   }
   else
   {
      res.redirect('/Login');
   }
});


app.post('/page_loader', (req, res) => {
   const data = req.body;
   const webData = data;
   if(webData.info !== undefined && webData.info === "accountpage")
   {
      if(req.session.username)
      {
         const obj = `{"response": "`+ req.session.username +`"}`;
         res.send(obj);
      }
   }
});
app.post('/process_post_req', (req, res) => {
   try {
      // Get the JSON data from the request
      const data = req.body;
      const webData = data;
      const type = webData.action;

      // If it's a true statement, then we can send the POST request
      //Login
      if (type !== undefined && type === 'process_login' && webData.password !== undefined && webData.username !== undefined) {
         if ( clean(webData.password) && clean(webData.username))
         {
            console.log("1");
            // callback
            const query = {
               // give the query a unique name
               name: 'fetch-user',
               text: 'SELECT username FROM users WHERE username= $1 AND password=$2',
               values: [webData.username, webData.password]
            };
            client.query(query, (err, res1) => {
               console.log("4");
               if (err) {
                  console.log(err.stack)
               } else {
                  if(res1.rows.length>0)
                  {

                     console.log("2");
                     //session1=req.session;
                     req.session.username = res1.rows[0]["username"];
                     const obj = `{"response": "0"}`;
                     res.send(obj);
                  }
                  else {
                     console.log("3");
                     const obj = `{"response": "1"}`;
                     res.send(obj);
                  }
               }
            })
         }
      } //Register
      else if (type !== undefined && type === 'process_register' && webData.password !== undefined && webData.username !== undefined && webData.email !== undefined && webData.fullname !== undefined) {
         var uname = webData.username;
         var fname = webData.fullname;
         var pass = webData.password;
         var mail = webData.email;
         var tBool = true;

         if (uname.length < 3 || pass.length < 6 || fname.length < 3 || mail.length < 6)
         { 
            tBool = false;

         }
         if (mail.indexOf('@') < 0 || mail.indexOf('.') < 0)
         {
            tBool = false;

         }
         if (!clean(pass) && !clean(uname) && !clean(mail) && !clean_fullname(fname))
         {
            tBool = false;
         }
         if (tBool)
         {
            //need to check that the user is allready exists SELECT where username>1 ,if good or not
            client.query('INSERT INTO users (username, password, fullname, email, permissions) values($1, $2, $3, $4, \'user\')', [uname, pass, fname, mail])
         }
      }
   } catch (err) {
      console.error(err);
   }
});

app.listen(port, () => {
   console.log(`Listening on port ${port}`);
});
