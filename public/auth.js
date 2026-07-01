async function checkLogin(){

    try{

        const res = await fetch("/api/auth/me",{

            credentials:"include"

        });

        if(res.status!==200){

            localStorage.removeItem("user");

            location.href="/login.html";

            return;

        }

        return await res.json();

    }

    catch(e){

        location.href="/login.html";

    }

}

async function logout(){

    await fetch("/api/auth/logout",{

        method:"POST",

        credentials:"include"

    });

    localStorage.removeItem("user");

    location.href="/login.html";

}

const btn = document.getElementById("logoutBtn");

if(btn){

    btn.onclick = logout;

}