async function login(){

const username =
document.getElementById("username").value;

const password =
document.getElementById("password").value;

const res = await fetch(

"/api/auth/login",

{

method:"POST",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify({

username,

password

})

}

);

const json =
await res.json();

if(json.success){

if(json.user.role==="admin"){

location.href="admin.html";

}else{

location.href="index.html";

}

}else{

document.getElementById("msg").innerHTML=

json.message;

}

}