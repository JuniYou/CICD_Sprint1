import express from 'express';
import pkg from 'pg';
const {Client} = pkg;

const client = new Client({
  user: 'shakeda',
  host: 'dpg-cgugbmg2qv2fdedbo640-a.frankfurt-postgres.render.com',
  database: 'juniyoudb',
  password: 'puMtqvjlq7ftkPfuvHwZFKUuZ5tlWQiV',
  port: 5432,
  ssl: true
});


const port = process.env.PORT || 80;
const app = express();
app.use(express.json());

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
            const obj = `{"response": "${webData.username}"}`;
            res.send(obj);
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
            client.connect()
               .then(() => {
                  client.query('INSERT INTO users values($1, $2, $3, $4)', [uname, pass, fname, mail])
               })
               .catch((err) => {
                  throw err;
            });
         }
      }
   } catch (err) {
      console.error(err);
   }
});

app.listen(port, () => {
   console.log(`Listening on port ${port}`);
});
