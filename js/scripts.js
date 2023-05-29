function Like(p,elem) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/update_post_data');
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onload = function () {
        var t = JSON.parse(this.responseText);
        if (t.response === '0')
        {
            elem.value = 'Unlike';
        }
        else if(t.response === '1')
        {
            elem.value = 'Like';
        }
        else
        {
            alert("Error occured");
        }
    };

    xhr.send(JSON.stringify({
      "action": "likepost",
      "post": p
    }));
}

function Save(p,elem) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/update_post_data');
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onload = function () {
        var t = JSON.parse(this.responseText);
        if (t.response === '0')
        {
            elem.value = 'Unsave';
        }
        else if(t.response === '1')
        {
            elem.value = 'Save';
        }
        else
        {
            alert("Error occured");
        }
    };

    xhr.send(JSON.stringify({
      "action": "savepost",
      "post": p
    }));
}
function Share(p,elem) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/update_post_data');
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onload = function () {
        var t = JSON.parse(this.responseText);
        if (t.response === '0')
        {
            elem.value = 'Unshare';
        }
        else if(t.response === '1')
        {
            elem.value = 'Share';
        }
        else
        {
            alert("Error occured");
        }
    };

    xhr.send(JSON.stringify({
      "action": "sharepost",
      "post": p
    }));
}
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