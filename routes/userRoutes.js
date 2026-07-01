const express = require("express");

const router = express.Router();

const {

    createUser,

    getUsers

} = require("../services/authService");

// ==========================
// GET USERS
// ==========================

router.get("/", async (req, res) => {

    try {

        const users = await getUsers();

        return res.json({

            success: true,

            data: users

        });

    } catch (e) {

        console.log(e);

        return res.status(500).json({

            error: true,

            message: e.message

        });

    }

});

// ==========================
// CREATE USER
// ==========================

router.post("/create", async (req, res) => {

    try {

        await createUser(req.body);

        return res.json({

            success: true

        });

    }

    catch (e) {

        console.log(e);

        return res.status(500).json({

            error: true,

            message: e.message

        });

    }

});

module.exports = router;