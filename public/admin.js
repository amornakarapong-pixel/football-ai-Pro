async function loadUsers(){

    try{

        const res = await fetch("/api/users",{
            credentials:"include"
        });

        const json = await res.json();

        let list = [];

        if(Array.isArray(json)){
            list = json;
        }
        else if(Array.isArray(json.data)){
            list = json.data;
        }
        else if(Array.isArray(json.users)){
            list = json.users;
        }

        const tbody = document.getElementById("userTable");

        tbody.innerHTML = "";

        list.forEach(u=>{

            tbody.innerHTML += `
<tr>
<td>${u.username}</td>
<td>${u.role}</td>
<td>${u.expire_date || "-"}</td>
<td>${Number(u.active)===1 ? "🟢 Active" : "🔴 Inactive"}</td>
</tr>
`;

        });

    }catch(err){

        console.log(err);

        alert("โหลดสมาชิกไม่สำเร็จ");

    }

}

async function createUser(){

    const username = document.getElementById("username").value.trim();

    const password = document.getElementById("password").value.trim();

    const role = document.getElementById("role").value;

    const expire = document.getElementById("expire").value;

    if(!username || !password || !expire){

        alert("กรอกข้อมูลให้ครบ");

        return;

    }

    const res = await fetch("/api/users/create",{

        method:"POST",

        credentials:"include",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({

            username,
            password,
            role,
            expire_date:new Date(expire).toISOString()

        })

    });

    const json = await res.json();

    if(json.success){

        alert("สร้างสมาชิกสำเร็จ");

        document.getElementById("username").value="";
        document.getElementById("password").value="";
        document.getElementById("expire").value="";

        await loadUsers();

    }else{

        alert(json.message || "ผิดพลาด");

    }

}

loadUsers();