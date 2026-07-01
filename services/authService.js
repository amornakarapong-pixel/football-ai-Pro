const { pool } = require("../database/db");
const bcrypt = require("bcrypt");

// ==========================
// LOGIN
// ==========================

async function login(username, password){

    const result = await pool.query(
        `
        SELECT *
        FROM users
        WHERE username = $1
        `,
        [username]
    );

    if(result.rows.length === 0){

        return {
            error:true,
            message:"User not found"
        };

    }

    const user = result.rows[0];

    if(user.active !== 1){

        return {
            error:true,
            message:"User inactive"
        };

    }

    const now = new Date();

    if(new Date(user.expire_date) < now){

        return {
            error:true,
            message:"Member expired"
        };

    }

    const ok =
    bcrypt.compareSync(
        password,
        user.password
    );

    if(!ok){

        return {
            error:true,
            message:"Wrong password"
        };

    }

    return {

        success:true,

        user:{

            id:user.id,

            username:user.username,

            role:user.role,

            expire_date:user.expire_date

        }

    };

}

// ==========================
// CREATE USER
// ==========================

async function createUser(data){

    const hash =
    bcrypt.hashSync(
        data.password,
        10
    );

    await pool.query(

        `
        INSERT INTO users(

            username,
            password,
            role,
            expire_date,
            active

        )

        VALUES(

            $1,
            $2,
            $3,
            $4,
            1

        )
        `,

        [

            data.username,

            hash,

            data.role || "member",

            data.expire_date

        ]

    );

}

// ==========================
// DEFAULT ADMIN
// ==========================

async function createDefaultAdmin(){

    const check =
    await pool.query(

        `
        SELECT id
        FROM users
        WHERE username='admin'
        `

    );

    if(check.rows.length){

        console.log("ADMIN EXISTS");

        return;

    }

    const hash =
    bcrypt.hashSync(
        "admin123",
        10
    );

    await pool.query(

        `
        INSERT INTO users(

            username,
            password,
            role,
            expire_date,
            active

        )

        VALUES(

            $1,
            $2,
            $3,
            $4,
            1

        )
        `,

        [

            "admin",

            hash,

            "admin",

            "2099-12-31"

        ]

    );

    console.log("DEFAULT ADMIN CREATED");

}

// ==========================
// GET USERS
// ==========================

async function getUsers(){

    const result =
    await pool.query(

        `
        SELECT

            id,

            username,

            role,

            expire_date,

            active

        FROM users

        ORDER BY id DESC
        `

    );

    return result.rows;

}

module.exports = {

    login,

    createUser,

    createDefaultAdmin,

    getUsers

};