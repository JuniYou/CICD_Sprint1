import express from 'express';
import pkg from 'pg';
import session from 'express-session';
import cookieParser from 'cookie-parser';

const { Client } = pkg;

const client = new Client({
   user: 'shakeda',
   host: 'dpg-cgugbmg2qv2fdedbo640-a.frankfurt-postgres.render.com',
   database: 'juniyoudb',
   password: 'puMtqvjlq7ftkPfuvHwZFKUuZ5tlWQiV',
   port: 5432,
   ssl: true,
});

client.connect();
const port = process.env.PORT || 80;
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(session({
   secret: 'asdfkml5rtythytt6onjghfojfdpflhplp9trd7htru5u4969u',
   saveUninitialized: false,
   resave: false,
}));

function clean(str) {
   for (let i = 0; i < str.length; i += 1) {
      if (str[i] < 'a' || str[i] > 'z') {
         if (str[i] < 'A' || str[i] > 'Z') {
            if (str[i] < '0' || str[i] > '9') {
               if (str[i] !== '@' && str[i] !== '.') {
                  return false;
               }
            }
         }
      }
   }
   return true;
}
function cleanFullName(str) {
   for (let i = 0; i < str.length; i += 1) {
      if (str[i] < 'a' || str[i] > 'z') {
         if (str[i] < 'A' || str[i] > 'Z') {
            if (str[i] < '0' || str[i] > '9') {
               if (str[i] !== '@' && str[i] !== '.') {
                  if (str[i] === ' ' && str.indexOf(' ') === str.lastIndexOf(' ')) {
                     continue;
                  } else {
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
   if (req.session.username === undefined) {
      res.sendFile('page/index.html', { root: './' });
   } else {
      res.redirect('/Home');
   }
});

app.get('/Login', (req, res) => {
   if (req.session.username === undefined) {
      res.sendFile('page/login.html', { root: './' });
   } else {
      res.redirect('/Home');
   }
});

app.get('/Logout', (req, res) => {
   req.session.username = undefined;
   if (req.session.admin !== undefined) {
      req.session.admin = undefined;
   }
   res.redirect('/');
});

app.get('/getstyle', (req, res) => {
   res.sendFile('style/style.css', { root: './' });
});

app.get('/Register', (req, res) => {
   if (req.session.username === undefined) {
      res.sendFile('page/register.html', { root: './' });
   } else {
      res.redirect('/Home');
   }
});
app.get('/Admin', (req, res) => {
   if (req.session.username !== undefined && req.session.admin !== undefined) {
      res.sendFile('page/admin.html', { root: './' });
   } else {
      res.redirect('/Home');
   }
});

app.get('/getjs', (req, res) => {
   res.sendFile('js/scripts.js', { root: './' });
});
app.get('/Home', (req, res) => {
   if (req.session.username !== undefined) {
      res.sendFile('page/home.html', { root: './' });
   } else {
      res.redirect('/Login');
   }
});

app.get('/Account', async (req, res) => {
   if (req.session.username !== undefined) {
      if (req.query.acc === undefined) {
         res.sendFile('page/account.html', { root: './' });
      } else {
         const { acc } = req.query;
         if (acc.length < 3 || acc.length > 30 || !clean(acc)) {
            const strToSend = '<!DOCTYPE html><html lang="en" ><head><meta charset="UTF-8"><title>Programmers network</title><link rel="stylesheet" href="getstyle"></head><body><nav class="skew-menu"><ul><li><a href="/Home">Home</a></li><li><a href="/Account">Personal Area</a></li><li><a href="/Logout">Log Out</a></li></ul></nav><div id="page_content">User not found</div></body></html>';
            res.send(strToSend);
         } else {
            const res1 = await client.query('SELECT * FROM users WHERE username= $1', [acc]); // DATABASE CONNECTION ARE IN DIFFERENT THREADS, NEED MANUAL TERAPY
            if (res1.rows.length > 0) {
               let strToSend = '<!DOCTYPE html><html lang="en" ><head><meta charset="UTF-8"><title>Programmers network</title><script src="/getjs"></script><script>function Follow(f){var xhr = new XMLHttpRequest();xhr.open("POST", "/update_user_data");xhr.setRequestHeader("Accept", "application/json");xhr.setRequestHeader("Content-Type", "application/json");xhr.onload = function () {var t = JSON.parse(this.responseText);if (t.response === "0"){alert("Success");window.location.reload();}else{alert("Error occured");}};xhr.send(JSON.stringify({"info": f,"infoType": "follow"}));}</script><link rel="stylesheet" href="getstyle"></head><body><nav class="skew-menu"><ul><li><a href="/Home">Home</a></li><li><a href="/Account">Personal Area</a></li><li><a href="/Logout">Log Out</a></li></ul></nav><div id="page_content">';

               let followed = false;
               let res2 = await client.query('SELECT * FROM follows WHERE username= $1 AND follows = $2', [req.session.username, acc]); // DATABASE CONNECTION ARE IN DIFFERENT THREADS, NEED MANUAL TERAPY
               if (res2.rows.length > 0) { followed = true; }
               strToSend += `<h4 class="table_title">Account Details</h4><table><tr><td>Username: ${res1.rows[0].username}</td></tr><tr><td>E-mail: ${res1.rows[0].email}</td></tr><tr><td>Full name: ${res1.rows[0].fullname}</td></tr><tr><td><input type="button" value="`;
               if (!followed) {
                  strToSend += 'Follow';
               } else {
                  strToSend += 'Unfollow';
               }
               strToSend += `" onclick="Follow('${res1.rows[0].username}')"></td></tr></table></div>`;

               // posts
               strToSend += '<h4 class="table_title">Latest posts by this user</h4>';
               res2 = await client.query('SELECT * FROM posts WHERE deleted = \'0\' AND postedby= $1 UNION SELECT * FROM posts p WHERE p.pid=ANY(SELECT s.pid FROM shares s WHERE s.username = $2) ORDER BY publishdate DESC', [acc, acc]); // DATABASE CONNECTION ARE IN DIFFERENT THREADS, NEED MANUAL TERAPY

               for (let i = 0; i < res2.rows.length; i += 1) {
                  strToSend += '<div style="width=50%; text-align:center;">';
                  strToSend = `${strToSend}<h4>${res2.rows[i].title}</h4><h5>${res2.rows[i].content}</h5><h6>Post date: ${res2.rows[i].publishdate} by user: <a href = "/Account?acc=${res2.rows[i].postedby}">${res2.rows[i].postedby}</a>`;
                  if (res2.rows[i].postedby !== acc) {
                     strToSend += ` Shared by: <a href = "/Account?acc=${acc}">${acc}</a>`;
                  }
                  strToSend += '</h6>';
                  if (res2.rows[i].postedby !== req.session.username) {
                     let like = 'Like';
                     let save = 'Save';
                     let share = 'Share';
                     let res3 = await client.query('SELECT * FROM likes WHERE username = $1 AND pid= $2', [req.session.username, res2.rows[i].pid]); // DATABASE CONNECTION ARE IN DIFFERENT THREADS, NEED MANUAL TERAPY
                     if (res3.rows.length > 0) {
                        like = 'Unlike';
                     }
                     res3 = await client.query('SELECT * FROM saves WHERE username = $1 AND pid= $2', [req.session.username, res2.rows[i].pid]); // DATABASE CONNECTION ARE IN DIFFERENT THREADS, NEED MANUAL TERAPY
                     if (res3.rows.length > 0) {
                        save = 'Unsave';
                     }
                     res3 = await client.query('SELECT * FROM shares WHERE username = $1 AND pid= $2', [req.session.username, res2.rows[i].pid]); // DATABASE CONNECTION ARE IN DIFFERENT THREADS, NEED MANUAL TERAPY
                     if (res3.rows.length > 0) {
                        share = 'Unshare';
                     }
                     strToSend += `<input type="button" id="like${res2.rows[i].pid}" value="${like}" onclick="Like(${res2.rows[i].pid},this)">&nbsp<input type="button" id="save${res2.rows[i].pid}" value="${save}" onclick="Save(${res2.rows[i].pid},this)">&nbsp<input type="button" id="share${res2.rows[i].pid}" value="${share}" onclick="Share(${res2.rows[i].pid},this)">`;
                  }
                  strToSend += '</div>';
                  strToSend += '<hr>';
               }

               strToSend += '</div></body></html>';
               res.send(strToSend);
            } else {
               const strToSend = '<!DOCTYPE html><html lang="en" ><head><meta charset="UTF-8"><title>Programmers network</title><link rel="stylesheet" href="getstyle"></head><body><nav class="skew-menu"><ul><li><a href="/Home">Home</a></li><li><a href="/Account">Personal Area</a></li><li><a href="/Logout">Log Out</a></li></ul></nav><div id="page_content">User not found</div></body></html>';
               res.send(strToSend);
            }
         }
      }
   } else {
      res.redirect('/Login');
   }
});

app.post('/update_user_data', async (req, res) => {
   if (req.session.username !== undefined) {
      const data = req.body;
      const webData = data;
      if (webData.info !== undefined) {
         if (webData.infoType !== undefined && webData.infoType === 'pass') {
            const pass = webData.info;
            let tbull = true;
            if (!clean(pass) || pass.length > 30 || pass.length < 6) {
               tbull = false;
            }
            if (tbull) {
               client.query('UPDATE users set password = $1 WHERE username = $2', [pass, req.session.username]);
               const obj = '{"response": "0"}';
               res.send(obj);
            }
         } else if (webData.infoType !== undefined && webData.infoType === 'email') {
            const mail = webData.info;
            let tbull = true;
            if (!clean(mail) || mail.length > 30 || mail.length < 6 || mail.indexOf('@') < 0 || mail.indexOf('.') < 0) {
               tbull = false;
            }
            if (tbull) {
               client.query('UPDATE users set email = $1 WHERE username = $2', [mail, req.session.username]);
               const obj = '{"response": "0"}';
               res.send(obj);
            }
         } else if (webData.infoType !== undefined && webData.infoType === 'fullname') {
            const fname = webData.info;
            let tbull = true;
            if (!cleanFullName(fname) || fname.length > 100 || fname.length < 3) {
               tbull = false;
            }
            if (tbull) {
               client.query('UPDATE users set fullname = $1 WHERE username = $2', [fname, req.session.username]);
               const obj = '{"response": "0"}';
               res.send(obj);
            }
         } else if (webData.infoType !== undefined && webData.infoType === 'delete') {
            client.query('UPDATE users set banned = 1 WHERE username = $1', [req.session.username]);
            req.session.username = undefined;
            const obj = '{"response": "0"}';
            res.send(obj);
         } else if (webData.infoType !== undefined && webData.infoType === 'deleteFollows') {
            if (!clean(webData.info)) {
               return;
            }
            client.query('DELETE FROM follows WHERE username = $1 AND follows = $2', [req.session.username, webData.info]);
            const obj = '{"response": "0"}';
            res.send(obj);
         } else if (webData.infoType !== undefined && webData.infoType === 'deleteFollower') {
            if (!clean(webData.info)) {
               return;
            }
            client.query('DELETE FROM follows WHERE username = $1 AND follows = $2', [webData.info, req.session.username]);
            const obj = '{"response": "0"}';
            res.send(obj);
         } else if (webData.infoType !== undefined && webData.infoType === 'follow') {
            if (!clean(webData.info)) {
               return;
            }
            let followed = false;
            const res2 = await client.query('SELECT * FROM follows WHERE username= $1 AND follows = $2', [req.session.username, webData.info]); // DATABASE CONNECTION ARE IN DIFFERENT THREADS, NEED MANUAL TERAPY
            if (res2.rows.length > 0) { followed = true; }
            if (followed) {
               client.query('DELETE FROM follows WHERE username = $1 AND follows = $2', [req.session.username, webData.info]);
            } else {
               client.query('INSERT INTO follows VALUES($1,$2)', [req.session.username, webData.info]);
            }
            const obj = '{"response": "0"}';
            res.send(obj);
         }
      }
   } else {
      res.redirect('/Login');
   }
});

app.post('/update_post_data', async (req, res) => {
   if (req.session.username !== undefined) {
      const data = req.body;
      const webData = data;
      if (webData.action !== undefined && webData.action === 'addpost') {
         if (webData.content !== undefined && webData.content.length > 9 && webData.content.length <= 5000 && webData.title !== undefined && webData.title.length > 4 && webData.title.length < 200) {
            client.query('INSERT INTO posts (title, content, postedby, publishdate) values($1, $2, $3, NOW())', [webData.title, webData.content, req.session.username]);
            const obj = '{"response": "0"}';
            res.send(obj);
         }
      } else if (webData.action !== undefined && webData.action === 'updatepost') {
         if (webData.content !== undefined && webData.content.length > 9 && webData.content.length <= 5000 && webData.title !== undefined && webData.title.length > 4 && webData.title.length < 200 && webData.post1 !== undefined && clean(webData.post1)) {
            const res2 = await client.query('SELECT * FROM posts WHERE pid= $1 AND deleted = \'0\'', [webData.post1]); // DATABASE CONNECTION ARE IN DIFFERENT THREADS, NEED MANUAL TERAPY

            if (res2.rows.length === 1 && res2.rows[0].postedby === req.session.username) {
               await client.query('UPDATE posts SET title=$1, content=$2 WHERE pid = $3', [webData.title, webData.content, webData.post1]);
               const obj = '{"response": "0"}';
               res.send(obj);
            }
         }
      } else if (webData.action !== undefined && webData.action === 'deletepost') {
         if (webData.post !== undefined && clean(webData.post)) {
            const res2 = await client.query('SELECT * FROM posts WHERE pid= $1 AND deleted = \'0\'', [webData.post]); // DATABASE CONNECTION ARE IN DIFFERENT THREADS, NEED MANUAL TERAPY
            if (res2.rows.length === 1 && res2.rows[0].postedby === req.session.username) {
               await client.query('UPDATE posts SET deleted = \'1\' WHERE pid = $1', [webData.post]);
               const obj = '{"response": "0"}';
               res.send(obj);
            }
         }
      } else if (webData.action !== undefined && webData.action === 'likepost') {
         if (webData.post !== undefined && clean(webData.post)) {
            let liked = false;
            const res2 = await client.query('SELECT * FROM likes WHERE username= $1 AND pid = $2', [req.session.username, webData.post]); // DATABASE CONNECTION ARE IN DIFFERENT THREADS, NEED MANUAL TERAPY
            if (res2.rows.length > 0) { liked = true; }
            const res3 = await client.query('SELECT * FROM posts WHERE pid=$1', [webData.post]);
            if (res3.rows[0].postedby === req.session.username) {
               return;
            }
            if (liked) {
               client.query('DELETE FROM likes WHERE username = $1 AND pid = $2', [req.session.username, webData.post]);
               const obj = '{"response": "1"}';
               res.send(obj);
            } else {
               client.query('INSERT INTO likes VALUES($1,$2)', [webData.post, req.session.username]);
               const obj = '{"response": "0"}';
               res.send(obj);
            }
         }
      } else if (webData.action !== undefined && webData.action === 'savepost') {
         if (webData.post !== undefined && clean(webData.post)) {
            let saved = false;
            const res2 = await client.query('SELECT * FROM saves WHERE username= $1 AND pid = $2', [req.session.username, webData.post]); // DATABASE CONNECTION ARE IN DIFFERENT THREADS, NEED MANUAL TERAPY
            if (res2.rows.length > 0) { saved = true; }
            if (saved) {
               client.query('DELETE FROM saves WHERE username = $1 AND pid = $2', [req.session.username, webData.post]);
               const obj = '{"response": "1"}';
               res.send(obj);
            } else {
               client.query('INSERT INTO saves VALUES($1,$2)', [webData.post, req.session.username]);
               const obj = '{"response": "0"}';
               res.send(obj);
            }
         }
      } else if (webData.action !== undefined && webData.action === 'sharepost') {
         if (webData.post !== undefined && clean(webData.post)) {
            let shared = false;
            const res2 = await client.query('SELECT * FROM shares WHERE username= $1 AND pid = $2', [req.session.username, webData.post]); // DATABASE CONNECTION ARE IN DIFFERENT THREADS, NEED MANUAL TERAPY
            if (res2.rows.length > 0) { shared = true; }
            const res3 = await client.query('SELECT * FROM posts WHERE pid=$1', [webData.post]);
            if (res3.rows[0].postedby === req.session.username) {
               return;
            }
            if (shared) {
               client.query('DELETE FROM shares WHERE username = $1 AND pid = $2', [req.session.username, webData.post]);
               const obj = '{"response": "1"}';
               res.send(obj);
            } else {
               client.query('INSERT INTO shares VALUES($1,$2)', [webData.post, req.session.username]);
               const obj = '{"response": "0"}';
               res.send(obj);
            }
         }
      }
   } else {
      res.redirect('/Login');
   }
});

app.post('/admin_update', async (req, res) => {
   if (req.session.username !== undefined && req.session.admin !== undefined) {
      const data = req.body;
      const webData = data;
      if (webData.action !== undefined && webData.action === 'updatepost') {
         if (webData.content !== undefined && webData.content.length > 9 && webData.content.length <= 5000 && webData.title !== undefined && webData.title.length > 4 && webData.title.length < 200 && webData.post1 !== undefined && clean(webData.post1)) {
            client.query('UPDATE posts SET title=$1, content=$2 WHERE pid = $3', [webData.title, webData.content, webData.post1]);
            const obj = '{"response": "0"}';
            res.send(obj);
         }
      } else if (webData.action !== undefined && webData.action === 'deletepost') {
         if (webData.post !== undefined && clean(webData.post)) {
            client.query('UPDATE posts SET deleted = \'1\' WHERE pid = $1', [webData.post]);
            const obj = '{"response": "0"}';
            res.send(obj);
         }
      } else if (webData.action !== undefined && webData.action === 'updateuser') {
         if (webData.pass === undefined || webData.fname === undefined || webData.mail === undefined || webData.user === undefined) {
            return;
         }
         const { user } = webData;
         const { pass } = webData;
         const { fname } = webData;
         const { mail } = webData;
         if (pass.length >= 6 && clean(pass) && mail.length >= 6 && clean(mail) && mail.indexOf('@') >= 0 && mail.indexOf('.') >= 0 && fname.length >= 3 && cleanFullName(fname) && clean(user)) {
            client.query('UPDATE users SET password=$1, email=$2, fullname=$3 WHERE username = $4', [pass, mail, fname, user]);
            const obj = '{"response": "0"}';
            res.send(obj);
         }
      } else if (webData.action !== undefined && webData.action === 'deleteuser') {
         if (webData.user !== undefined && clean(webData.user)) {
            let banned = false;
            const res2 = await client.query('SELECT * FROM users WHERE username= $1 AND banned<>\'0\'', [webData.user]); // DATABASE CONNECTION ARE IN DIFFERENT THREADS, NEED MANUAL TERAPY
            if (res2.rows.length > 0) { banned = true; }
            if (!banned) {
               client.query('UPDATE users SET banned=\'1\' WHERE username=$1', [webData.user]);
               const obj = '{"response": "0"}';
               res.send(obj);
            } else {
               client.query('UPDATE users SET banned=\'0\' WHERE username=$1', [webData.user]);
               const obj = '{"response": "1"}';
               res.send(obj);
            }
         }
      } else if (webData.action !== undefined && webData.action === 'updatetip') {
         if (webData.content !== undefined && webData.content.length > 9 && webData.content.length <= 5000 && webData.title !== undefined && webData.title.length > 4 && webData.title.length < 200 && webData.post1 !== undefined && clean(webData.post1)) {
            client.query('UPDATE tips SET title=$1, content=$2 WHERE pid = $3', [webData.title, webData.content, webData.post1]);
            const obj = '{"response": "0"}';
            res.send(obj);
         }
      } else if (webData.action !== undefined && webData.action === 'deletetip') {
         if (webData.post !== undefined && clean(webData.post)) {
            client.query('UPDATE tips SET deleted = \'1\' WHERE pid = $1', [webData.post]);
            const obj = '{"response": "0"}';
            res.send(obj);
         }
      } else if (webData.action !== undefined && webData.action === 'addtip') {
         if (webData.content !== undefined && webData.content.length > 9 && webData.content.length <= 5000 && webData.title !== undefined && webData.title.length > 4 && webData.title.length < 200) {
            client.query('INSERT INTO tips (title, content) values($1, $2)', [webData.title, webData.content]);
            const obj = '{"response": "0"}';
            res.send(obj);
         }
      }
   } else {
      res.redirect('/Login');
   }
});

app.post('/page_loader', async (req, res) => {
   const data = req.body;
   const webData = data;
   if (webData.info !== undefined && webData.info === 'accountpage') {
      if (req.session.username) {
         let strToSend = '<div class=\\"submenu1\\"><div class=\\"opt\\" onclick=\\"ChangeSelection(1)\\">Account details</div><div class=\\"opt\\" onclick=\\"ChangeSelection(2)\\">Followed users</div><div class=\\"opt\\" onclick=\\"ChangeSelection(3)\\">Followers list</div><div class=\\"opt\\" onclick=\\"ChangeSelection(4)\\">Liked posts</div><div class=\\"opt\\" onclick=\\"ChangeSelection(5)\\">Saved posts</div><div class=\\"opt\\" onclick=\\"ChangeSelection(6)\\">Statistics</div></div>';
         let res1 = await client.query('SELECT * FROM users WHERE username= $1', [req.session.username]); // DATABASE CONNECTION ARE IN DIFFERENT THREADS, NEED MANUAL TERAPY
         if (res1.rows.length > 0) {
            strToSend = `${strToSend}<div id=\\"pills-1\\"><h4 class=\\"table_title\\">Account Details</h4><table><tr><td>Username: <input type=\\"text\\" disabled maxlength=\\"100\\" value=\\"${req.session.username}\\"></td></tr><tr><td>Password (type new password if you want to change): <input id=\\"pass1\\" type=\\"password\\" maxlength=\\"100\\"></td><td><input type=\\"button\\" value=\\"Save\\" onclick=\\"SavePass()\\"></td></tr><tr><td>E-mail: <input id=\\"email1\\" type=\\"text\\" maxlength=\\"100\\" value=\\"${res1.rows[0].email}\\"></td><td><input type=\\"button\\" value=\\"Save\\" onclick=\\"SaveEmail()\\"></td></tr><tr><td>Full name: <input id=\\"fname1\\" type=\\"text\\" maxlength=\\"100\\" value=\\"${res1.rows[0].fullname}\\"></td><td><input type=\\"button\\" value=\\"Save\\" onclick=\\"SaveFname()\\"></td></tr><tr><td><input type=\\"button\\" value=\\"Delete Account\\" onclick=\\"DeleteAcc()\\"></td></tr></table></div>`;
         } else {
            return;
         }
         res1 = await client.query('SELECT f.follows as follows, u.fullname as fu FROM follows f, users u WHERE f.username= $1 AND u.username = f.follows', [req.session.username]); // DATABASE CONNECTION ARE IN DIFFERENT THREADS, NEED MANUAL THERAPY
         strToSend += '<div id=\\"pills-2\\" style=\\"display:none;\\">';
         if (res1.rows.length < 1) {
            strToSend += '<h4 class=\\"table_title\\">Followed users</h4>You dont follow anyone';
         }
         strToSend += '<table border=\\"1\\"><tr><td>Username</td><td>Full name</td><td>Delete</td></tr>';
         for (let i = 0; i < res1.rows.length; i += 1) {
            strToSend += '<tr>';
            strToSend = `${strToSend}<td><a href = \\"/Account?acc=${res1.rows[i].follows}\\">${res1.rows[i].follows}</a></td><td>${res1.rows[i].fu}</td><td><input type=\\"button\\" value=\\"Delete\\" onclick=\\"Deletef('${res1.rows[i].follows}')\\"></td>`;
            strToSend += '</tr>';
         }
         strToSend += '</table>';
         strToSend += '</div>';

         // selection 3
         res1 = await client.query('SELECT f.username as follower, u.fullname as fu FROM follows f, users u WHERE f.follows= $1 AND u.username = f.username', [req.session.username]); // DATABASE CONNECTION ARE IN DIFFERENT THREADS, NEED MANUAL THERAPY
         strToSend += '<div id=\\"pills-3\\" style=\\"display:none;\\">';
         if (res1.rows.length < 1) {
            strToSend += '<h4 class=\\"table_title\\">Followers list</h4>You have no followers';
         }
         strToSend += '<table border=\\"1\\"><tr><td>Username</td><td>Full name</td><td>Delete</td></tr>';
         for (let i = 0; i < res1.rows.length; i += 1) {
            strToSend += '<tr>';
            strToSend = `${strToSend}<td><a href = \\"/Account?acc=${res1.rows[i].follower}\\">${res1.rows[i].follower}</a></td><td>${res1.rows[i].fu}</td><td><input type=\\"button\\" value=\\"Delete\\" onclick=\\"Deletefollower('${res1.rows[i].follower}')\\"></td>`;
            strToSend += '</tr>';
         }
         strToSend += '</table>';
         strToSend += '</div>';

         // selection 4
         strToSend += '<div id=\\"pills-4\\" style=\\"display:none;\\">Liked Posts<br />';
         res1 = await client.query('SELECT * FROM posts WHERE deleted = \'0\' AND pid=ANY(SELECT pid FROM likes WHERE username=$1) ORDER BY publishdate DESC', [req.session.username]); // DATABASE CONNECTION ARE IN DIFFERENT THREADS, NEED MANUAL TERAPY

         for (let i = 0; i < res1.rows.length; i += 1) {
            strToSend += '<div style=\\"width=50%; text-align:center;\\">';
            strToSend = `${strToSend}<h4>${res1.rows[i].title}</h4><h5>${res1.rows[i].content}</h5><h6>Post date: ${res1.rows[i].publishdate} by user: <a href = \\"/Account?acc=${res1.rows[i].postedby}\\">${res1.rows[i].postedby}</a></h6>`;
            if (res1.rows[i].postedby !== req.session.username) {
               let like = 'Like';
               let save = 'Save';
               let share = 'Share';
               let res3 = await client.query('SELECT * FROM likes WHERE username = $1 AND pid= $2', [req.session.username, res1.rows[i].pid]); // DATABASE CONNECTION ARE IN DIFFERENT THREADS, NEED MANUAL TERAPY
               if (res3.rows.length > 0) {
                  like = 'Unlike';
               }
               res3 = await client.query('SELECT * FROM saves WHERE username = $1 AND pid= $2', [req.session.username, res1.rows[i].pid]); // DATABASE CONNECTION ARE IN DIFFERENT THREADS, NEED MANUAL TERAPY
               if (res3.rows.length > 0) {
                  save = 'Unsave';
               }
               res3 = await client.query('SELECT * FROM shares WHERE username = $1 AND pid= $2', [req.session.username, res1.rows[i].pid]); // DATABASE CONNECTION ARE IN DIFFERENT THREADS, NEED MANUAL TERAPY
               if (res3.rows.length > 0) {
                  share = 'Unshare';
               }
               strToSend += `<input type=\\"button\\" id=\\"like${res1.rows[i].pid}\\" value=\\"${like}\\" onclick=\\"Like(${res1.rows[i].pid},this)\\">&nbsp<input type=\\"button\\" id=\\"save${res1.rows[i].pid}\\" value=\\"${save}\\" onclick=\\"Save(${res1.rows[i].pid},this)\\">&nbsp<input type=\\"button\\" id=\\"share${res1.rows[i].pid}\\" value=\\"${share}\\" onclick=\\"Share(${res1.rows[i].pid},this)\\">`;
            }
            strToSend += '</div>';
            strToSend += '<hr>';
         }

         strToSend += '</div>';
         // selection 5
         strToSend += '<div id=\\"pills-5\\" style=\\"display:none;\\">Saved posts<br />';

         res1 = await client.query('SELECT * FROM posts WHERE deleted = \'0\' AND pid=ANY(SELECT pid FROM saves WHERE username=$1) ORDER BY publishdate DESC', [req.session.username]); // DATABASE CONNECTION ARE IN DIFFERENT THREADS, NEED MANUAL TERAPY

         for (let i = 0; i < res1.rows.length; i += 1) {
            strToSend += '<div style=\\"width=50%; text-align:center;\\">';
            strToSend = `${strToSend}<h4>${res1.rows[i].title}</h4><h5>${res1.rows[i].content}</h5><h6>Post date: ${res1.rows[i].publishdate} by user: <a href = \\"/Account?acc=${res1.rows[i].postedby}\\">${res1.rows[i].postedby}</a></h6>`;
            if (res1.rows[i].postedby !== req.session.username) {
               let like = 'Like';
               let save = 'Save';
               let share = 'Share';
               let res3 = await client.query('SELECT * FROM likes WHERE username = $1 AND pid= $2', [req.session.username, res1.rows[i].pid]); // DATABASE CONNECTION ARE IN DIFFERENT THREADS, NEED MANUAL TERAPY
               if (res3.rows.length > 0) {
                  like = 'Unlike';
               }
               res3 = await client.query('SELECT * FROM saves WHERE username = $1 AND pid= $2', [req.session.username, res1.rows[i].pid]); // DATABASE CONNECTION ARE IN DIFFERENT THREADS, NEED MANUAL TERAPY
               if (res3.rows.length > 0) {
                  save = 'Unsave';
               }
               res3 = await client.query('SELECT * FROM shares WHERE username = $1 AND pid= $2', [req.session.username, res1.rows[i].pid]); // DATABASE CONNECTION ARE IN DIFFERENT THREADS, NEED MANUAL TERAPY
               if (res3.rows.length > 0) {
                  share = 'Unshare';
               }
               strToSend += `<input type=\\"button\\" id=\\"like${res1.rows[i].pid}\\" value=\\"${like}\\" onclick=\\"Like(${res1.rows[i].pid},this)\\">&nbsp<input type=\\"button\\" id=\\"save${res1.rows[i].pid}\\" value=\\"${save}\\" onclick=\\"Save(${res1.rows[i].pid},this)\\">&nbsp<input type=\\"button\\" id=\\"share${res1.rows[i].pid}\\" value=\\"${share}\\" onclick=\\"Share(${res1.rows[i].pid},this)\\">`;
            }
            strToSend += '</div>';
            strToSend += '<hr>';
         }

         strToSend += '</div>';
         // selection 6
         strToSend += '<div id=\\"pills-6\\" style=\\"display:none;\\">Statistics<br />';

         let res4 = await client.query('SELECT COUNT(*) as c FROM likes WHERE pid=ANY(SELECT pid FROM posts WHERE postedby=$1)', [req.session.username]); // DATABASE CONNECTION ARE IN DIFFERENT THREADS, NEED MANUAL TERAPY
         strToSend += `Total likes (Includes likes from deleted posts): ${res4.rows[0].c}<br />`;
         res4 = await client.query('WITH count_of_total_posts AS (SELECT COUNT(*) AS ctotal FROM posts WHERE deleted = \'0\') SELECT COUNT(*)::decimal/(SELECT ctotal FROM count_of_total_posts)*100 as c FROM posts WHERE postedby=$1 AND deleted = \'0\'', [req.session.username]); // DATABASE CONNECTION ARE IN DIFFERENT THREADS, NEED MANUAL TERAPY
         strToSend += `Percentage of post uploaded from total number of posts: ${res4.rows[0].c}%<br />`;

         strToSend += '</div>';

         let menu = '';
         if (req.session.admin === undefined) {
            menu += '<li><a href=\\"/Home\\">Home</a></li><li><a href=\\"/Account\\">Personal Area</a></li><li><a href=\\"/Logout\\">Log Out</a></li>';
         } else {
            menu += '<li><a href=\\"/Home\\">Home</a></li><li><a href=\\"/Account\\">Personal Area</a></li><li><a href=\\"/Admin\\">Admin panel</a></li><li><a href=\\"/Logout\\">Log Out</a></li>';
         }
         const obj = `{"response": "${strToSend}", "menu": "${menu}"}`;
         res.send(obj);
      }
   } else if (webData.info !== undefined && webData.info === 'homepage') {
      if (req.session.username) {
         let strToSend = '<div class=\\"submenu1\\"><div style=\\"background-color:cyan;\\" class=\\"opt\\" onclick=\\"ChangeSelection(1)\\">Trending posts</div><div class=\\"opt\\" onclick=\\"ChangeSelection(2)\\">My posts</div><div class=\\"opt\\" onclick=\\"ChangeSelection(3)\\">Add new post</div><div class=\\"opt\\" onclick=\\"ChangeSelection(4)\\">Posts by people I follow</div></div>';
         let res1 = await client.query('SELECT * FROM posts WHERE deleted = \'0\' ORDER BY publishdate DESC LIMIT 20'); // DATABASE CONNECTION ARE IN DIFFERENT THREADS, NEED MANUAL TERAPY
         strToSend = `${strToSend}<div id=\\"pills-1\\"><h3 class=\\"table_title\\">Trending posts</h3>`;

         for (let i = 0; i < res1.rows.length; i += 1) {
            strToSend += '<div style=\\"width=50%; text-align:center;\\">';
            strToSend = `${strToSend}<h4>${res1.rows[i].title}</h4><h5>${res1.rows[i].content}</h5><h6>Post date: ${res1.rows[i].publishdate} by user: <a href = \\"/Account?acc=${res1.rows[i].postedby}\\">${res1.rows[i].postedby}</a></h6>`;
            if (res1.rows[i].postedby !== req.session.username) {
               let like = 'Like';
               let save = 'Save';
               let share = 'Share';
               let res3 = await client.query('SELECT * FROM likes WHERE username = $1 AND pid= $2', [req.session.username, res1.rows[i].pid]); // DATABASE CONNECTION ARE IN DIFFERENT THREADS, NEED MANUAL TERAPY
               if (res3.rows.length > 0) {
                  like = 'Unlike';
               }
               res3 = await client.query('SELECT * FROM saves WHERE username = $1 AND pid= $2', [req.session.username, res1.rows[i].pid]); // DATABASE CONNECTION ARE IN DIFFERENT THREADS, NEED MANUAL TERAPY
               if (res3.rows.length > 0) {
                  save = 'Unsave';
               }
               res3 = await client.query('SELECT * FROM shares WHERE username = $1 AND pid= $2', [req.session.username, res1.rows[i].pid]); // DATABASE CONNECTION ARE IN DIFFERENT THREADS, NEED MANUAL TERAPY
               if (res3.rows.length > 0) {
                  share = 'Unshare';
               }
               strToSend += `<input type=\\"button\\" id=\\"like${res1.rows[i].pid}\\" value=\\"${like}\\" onclick=\\"Like(${res1.rows[i].pid},this)\\">&nbsp<input type=\\"button\\" id=\\"save${res1.rows[i].pid}\\" value=\\"${save}\\" onclick=\\"Save(${res1.rows[i].pid},this)\\">&nbsp<input type=\\"button\\" id=\\"share${res1.rows[i].pid}\\" value=\\"${share}\\" onclick=\\"Share(${res1.rows[i].pid},this)\\">`;
            }
            strToSend += '</div>';
            strToSend += '<hr>';
         }

         strToSend += '</div>';

         // selection 2
         strToSend = `${strToSend}<div style=\\"text-align:center;display:none;\\" id=\\"pills-2\\"><h3 class=\\"table_title\\">My posts</h3>`;
         res1 = await client.query('SELECT * FROM posts WHERE deleted = \'0\' AND postedby = $1 ORDER BY publishdate DESC', [req.session.username]); // DATABASE CONNECTION ARE IN DIFFERENT THREADS, NEED MANUAL TERAPY
         for (let i = 0; i < res1.rows.length; i += 1) {
            strToSend += '<div style=\\"width=50%; text-align:center;\\">';
            strToSend = `${strToSend}Title: <input type=\\"text\\" id=\\"titlein${res1.rows[i].pid}\\" maxlength=\\"200\\" value=\\"${res1.rows[i].title}\\"><br />Text:<br /><textarea maxlength=\\"5000\\" id=\\"contentTe${res1.rows[i].pid}\\" rows=\\"10\\" cols=\\"70\\">${res1.rows[i].content}</textarea><br />Post date: ${res1.rows[i].publishdate}<br /><button onclick=\\"SavePost('${res1.rows[i].pid}')\\">Save changes</button><button onclick=\\"DeletePost('${res1.rows[i].pid}')\\">Delete post</button>`;
            strToSend += '</div>';
            strToSend += '<hr>';
         }

         strToSend += '</div>';
         // selection 3
         strToSend = `${strToSend}<div style=\\"text-align:center;display:none;\\" id=\\"pills-3\\"><h3 class=\\"table_title\\">Add new post</h3>`;
         strToSend = `${strToSend}Title: <input type=\\"text\\" id=\\"titleInput\\" maxlength=\\"200\\"><br />Content:<br />`;
         strToSend += '<textarea maxlength=\\"5000\\" id=\\"contentText\\" rows=\\"10\\" cols=\\"70\\"></textarea><br />';
         strToSend += '<button onclick=\\"AddPost()\\">Add post</button>';

         strToSend += '</div>';

         // selection 4
         res1 = await client.query('SELECT * FROM posts WHERE deleted = \'0\' AND postedby=ANY(SELECT follows FROM follows WHERE username = $1) UNION SELECT * FROM posts p WHERE deleted=\'0\' AND p.pid=ANY(SELECT s.pid FROM shares s WHERE s.username=ANY(SELECT ff.follows FROM follows ff WHERE ff.username=$2)) ORDER BY publishdate DESC', [req.session.username, req.session.username]); // DATABASE CONNECTION ARE IN DIFFERENT THREADS, NEED MANUAL TERAPY
         strToSend = `${strToSend}<div style=\\"text-align:center;display:none;\\" id=\\"pills-4\\"><h3 class=\\"table_title\\">Posts by users I follow</h3>`;

         for (let i = 0; i < res1.rows.length; i += 1) {
            if (res1.rows[i].postedby !== req.session.username) {
               strToSend += '<div style=\\"width=50%; text-align:center;\\">';
               strToSend = `${strToSend}<h4>${res1.rows[i].title}</h4><h5>${res1.rows[i].content}</h5><h6>Post date: ${res1.rows[i].publishdate} by user: <a href = \\"/Account?acc=${res1.rows[i].postedby}\\">${res1.rows[i].postedby}</a>`;
               const res5 = await client.query('SELECT * FROM follows WHERE username = $1 AND follows = $2', [req.session.username, res1.rows[i].postedby]); // DATABASE CONNECTION ARE IN DIFFERENT THREADS, NEED MANUAL TERAPY
               if (res5.rows.length === 0) {
                  const res6 = await client.query('SELECT * FROM shares WHERE pid = $1 AND username = ANY(SELECT follows from follows WHERE username = $2) LIMIT 1', [res1.rows[i].pid, req.session.username]); // DATABASE CONNECTION ARE IN DIFFERENT THREADS, NEED MANUAL TERAPY
                  strToSend += ` Shared by: <a href = \\"/Account?acc=${res6.rows[0].username}\\">${res6.rows[0].username}</a>`;
               }
               strToSend += '</h6>';
               if (res1.rows[i].postedby !== req.session.username) {
                  let like = 'Like';
                  let save = 'Save';
                  let share = 'Share';
                  let res3 = await client.query('SELECT * FROM likes WHERE username = $1 AND pid= $2', [req.session.username, res1.rows[i].pid]); // DATABASE CONNECTION ARE IN DIFFERENT THREADS, NEED MANUAL TERAPY
                  if (res3.rows.length > 0) {
                     like = 'Unlike';
                  }
                  res3 = await client.query('SELECT * FROM saves WHERE username = $1 AND pid= $2', [req.session.username, res1.rows[i].pid]); // DATABASE CONNECTION ARE IN DIFFERENT THREADS, NEED MANUAL TERAPY
                  if (res3.rows.length > 0) {
                     save = 'Unsave';
                  }
                  res3 = await client.query('SELECT * FROM shares WHERE username = $1 AND pid= $2', [req.session.username, res1.rows[i].pid]); // DATABASE CONNECTION ARE IN DIFFERENT THREADS, NEED MANUAL TERAPY
                  if (res3.rows.length > 0) {
                     share = 'Unshare';
                  }
                  strToSend += `<input type=\\"button\\" id=\\"like${res1.rows[i].pid}\\" value=\\"${like}\\" onclick=\\"Like(${res1.rows[i].pid},this)\\">&nbsp<input type=\\"button\\" id=\\"save${res1.rows[i].pid}\\" value=\\"${save}\\" onclick=\\"Save(${res1.rows[i].pid},this)\\">&nbsp<input type=\\"button\\" id=\\"share${res1.rows[i].pid}\\" value=\\"${share}\\" onclick=\\"Share(${res1.rows[i].pid},this)\\">`;
               }
               strToSend += '</div>';
               strToSend += '<hr>';
            }
         }

         strToSend += '</div>';
         let menu = '';
         if (req.session.admin === undefined) {
            menu += '<li><a href=\\"/Home\\">Home</a></li><li><a href=\\"/Account\\">Personal Area</a></li><li><a href=\\"/Logout\\">Log Out</a></li>';
         } else {
            menu += '<li><a href=\\"/Home\\">Home</a></li><li><a href=\\"/Account\\">Personal Area</a></li><li><a href=\\"/Admin\\">Admin panel</a></li><li><a href=\\"/Logout\\">Log Out</a></li>';
         }
         const obj = `{"response": "${strToSend}", "menu": "${menu}"}`;
         res.send(obj);
      }
   } else if (webData.info !== undefined && webData.info === 'adminpage') {
      if (req.session.username && req.session.admin) {
         let strToSend = '<div class=\\"submenu1\\"><div style=\\"background-color:cyan;\\" class=\\"opt\\" onclick=\\"ChangeSelection(1)\\">Post managing</div><div class=\\"opt\\" onclick=\\"ChangeSelection(2)\\">User managing</div><div class=\\"opt\\" onclick=\\"ChangeSelection(3)\\">Daily tips managing</div></div>';
         // selection 1
         let res1 = await client.query('SELECT * FROM posts WHERE deleted = \'0\' ORDER BY publishdate DESC'); // DATABASE CONNECTION ARE IN DIFFERENT THREADS, NEED MANUAL TERAPY
         strToSend = `${strToSend}<div id=\\"pills-1\\"><h3 class=\\"table_title\\">Post managing</h3>`;
         strToSend += '<table border=\\"1\\"><tr><td>ID</td><td>Title</td><td>Content</td><td>Posted by</td><td>Publish date</td><td>Save</td><td>Delete</td></tr>';
         for (let i = 0; i < res1.rows.length; i += 1) {
            strToSend += `<tr id=\\"line${res1.rows[i].pid}\\">`;
            strToSend = `${strToSend}<td>${res1.rows[i].pid}</td><td><input type=\\"text\\" id=\\"titlein${res1.rows[i].pid}\\" maxlength=\\"200\\" value=\\"${res1.rows[i].title}\\"></td><td><textarea maxlength=\\"5000\\" id=\\"contentTe${res1.rows[i].pid}\\" rows=\\"5\\" cols=\\"50\\">${res1.rows[i].content}</textarea></td><td>${res1.rows[i].postedby}</td><td>${res1.rows[i].publishdate}</td><td><input type=\\"button\\" value=\\"Save\\" onclick=\\"SavePost('${res1.rows[i].pid}')\\"></td><td><input type=\\"button\\" value=\\"Delete\\" onclick=\\"DeletePost('${res1.rows[i].pid}')\\"></td>`;
            strToSend += '</tr>';
         }
         strToSend += '</table>';

         strToSend += '</div>';

         // selection 2
         strToSend = `${strToSend}<div style=\\"text-align:center;display:none;\\" id=\\"pills-2\\"><h3 class=\\"table_title\\">User managing</h3>`;
         res1 = await client.query('SELECT * FROM users'); // DATABASE CONNECTION ARE IN DIFFERENT THREADS, NEED MANUAL TERAPY
         strToSend += '<table border=\\"1\\"><tr><td>Username</td><td>Password</td><td>E-mail</td><td>Full name</td><td>Banned</td><td>Save</td><td>Ban</td></tr>';
         for (let i = 0; i < res1.rows.length; i += 1) {
            strToSend += '<tr>';
            let ban = 'No';
            let banBut = 'Ban';
            if (res1.rows[i].banned !== '0') {
               ban = 'Yes';
               banBut = 'Unban';
            }
            strToSend = `${strToSend}<td>${res1.rows[i].username}</td><td><input type=\\"text\\" id=\\"passU${res1.rows[i].username}\\" maxlength=\\"30\\" value=\\"${res1.rows[i].password}\\"></td><td><input type=\\"text\\" id=\\"emailU${res1.rows[i].username}\\" maxlength=\\"30\\" value=\\"${res1.rows[i].email}\\"></td><td><input type=\\"text\\" id=\\"fullnU${res1.rows[i].username}\\" maxlength=\\"30\\" value=\\"${res1.rows[i].fullname}\\"></td><td id=\\"lineU${res1.rows[i].username}\\">${ban}</td><td><input type=\\"button\\" value=\\"Save\\" onclick=\\"SaveUser('${res1.rows[i].username}')\\"></td><td><input id=\\"banbut${res1.rows[i].username}\\" type=\\"button\\" value=\\"${banBut}\\" onclick=\\"DeleteUser('${res1.rows[i].username}')\\"></td>`;
            strToSend += '</tr>';
         }
         strToSend += '</table>';

         strToSend += '</div>';
         // selection 3
         strToSend = `${strToSend}<div style=\\"text-align:center;display:none;\\" id=\\"pills-3\\"><h2 class=\\"table_title\\">Daily tips managing</h2><h3>Add Daily tip</h3>`;
         strToSend = `${strToSend}Title: <input type=\\"text\\" id=\\"titleInput\\" maxlength=\\"200\\"><br />Content:<br />`;
         strToSend += '<textarea maxlength=\\"5000\\" id=\\"contentText\\" rows=\\"10\\" cols=\\"70\\"></textarea><br />';
         strToSend += '<button onclick=\\"AddTip()\\">Add Daily tip</button>';

         strToSend += '<h3>Manage existing daily tips</h3>';
         res1 = await client.query('SELECT * FROM tips WHERE deleted = \'0\''); // DATABASE CONNECTION ARE IN DIFFERENT THREADS, NEED MANUAL TERAPY
         strToSend += '<table border=\\"1\\"><tr><td>ID</td><td>Title</td><td>Content</td><td>Save</td><td>Delete</td></tr>';
         for (let i = 0; i < res1.rows.length; i += 1) {
            strToSend += `<tr id=\\"lineT${res1.rows[i].pid}\\">`;
            strToSend = `${strToSend}<td>${res1.rows[i].pid}</td><td><input type=\\"text\\" id=\\"titleinT${res1.rows[i].pid}\\" maxlength=\\"200\\" value=\\"${res1.rows[i].title}\\"></td><td><textarea maxlength=\\"5000\\" id=\\"contentTeT${res1.rows[i].pid}\\" rows=\\"5\\" cols=\\"50\\">${res1.rows[i].content}</textarea></td><td><input type=\\"button\\" value=\\"Save\\" onclick=\\"SaveTip('${res1.rows[i].pid}')\\"></td><td><input type=\\"button\\" value=\\"Delete\\" onclick=\\"DeleteTip('${res1.rows[i].pid}')\\"></td>`;
            strToSend += '</tr>';
         }
         strToSend += '</table>';

         strToSend += '</div>';

         let menu = '';
         if (req.session.admin === undefined) {
            menu += '<li><a href=\\"/Home\\">Home</a></li><li><a href=\\"/Account\\">Personal Area</a></li><li><a href=\\"/Logout\\">Log Out</a></li>';
         } else {
            menu += '<li><a href=\\"/Home\\">Home</a></li><li><a href=\\"/Account\\">Personal Area</a></li><li><a href=\\"/Admin\\">Admin panel</a></li><li><a href=\\"/Logout\\">Log Out</a></li>';
         }
         const obj = `{"response": "${strToSend}", "menu": "${menu}"}`;
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
      // Login
      if (type !== undefined && type === 'process_login' && webData.password !== undefined && webData.username !== undefined) {
         if (clean(webData.password) && clean(webData.username)) {
            // callback
            const query = {
               // give the query a unique name
               name: 'fetch-user',
               text: 'SELECT username, permissions FROM users WHERE username= $1 AND password=$2 AND banned = \'0\'',
               values: [webData.username, webData.password],
            };
            client.query(query, (err, res1) => {
               if (err) {
                  console.log(err.stack);
               } else if (res1.rows.length > 0) {
                  req.session.username = res1.rows[0].username;
                  if (res1.rows[0].permissions === 'admin') {
                     req.session.admin = '1';
                  }
                  const obj = '{"response": "0"}';
                  res.send(obj);
               } else {
                  const obj = '{"response": "1"}';
                  res.send(obj);
               }
            });
         } // Register
      } else if (type !== undefined && type === 'process_register' && webData.password !== undefined && webData.username !== undefined && webData.email !== undefined && webData.fullname !== undefined) {
         const uname = webData.username;
         const fname = webData.fullname;
         const pass = webData.password;
         const mail = webData.email;
         let tBool = true;

         if (uname.length < 3 || pass.length < 6 || fname.length < 3 || mail.length < 6 || pass.length > 30 || fname.length > 100 || mail.length > 30 || uname.length > 30) {
            tBool = false;
         }
         if (mail.indexOf('@') < 0 || mail.indexOf('.') < 0) {
            tBool = false;
         }
         if (!clean(pass) && !clean(uname) && !clean(mail) && !cleanFullName(fname)) {
            tBool = false;
         }
         if (tBool) {
            const query = {
               text: 'SELECT * FROM users WHERE username= $1',
               values: [uname],
            };
            client.query(query, (err, res2) => {
               if (err) {
                  console.log(err.stack);
               } else if (res2.rows.length > 0) {
                  const obj = '{"response": "1"}';
                  res.send(obj);
               } else {
                  client.query('INSERT INTO users (username, password, fullname, email, permissions) values($1, $2, $3, $4, \'user\')', [uname, pass, fname, mail]);
                  const obj = '{"response": "0"}';
                  res.send(obj);
               }
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
