function AddComment(p) {
    var content = document.getElementById("contentComment").value;
    if (content.length < 10)
    {
      alert("Minimun content length is 10");
      return;
    }
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/update_post_data');
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onload = function () {
        var t = JSON.parse(this.responseText);
        if (t.response === '0')
        {
            alert("Added successfully");
            window.location.reload();
        }
        else
        {
            alert("Error occured");
        }
    };

    xhr.send(JSON.stringify({
      "pid": p,
      "content": content,
      "action": "addcomment"
    }));
}
function DeleteComment(p) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/update_post_data');
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onload = function () {
        var t = JSON.parse(this.responseText);
        if (t.response === '0')
        {
            alert("Deleted successfully");
            window.location.reload();
        }
        else
        {
            alert("Error occured");
        }
    };

    xhr.send(JSON.stringify({
      "action": "deletecomment",
      "pid": p
    }));
}