const express = require("express");

const router = express.Router();

const {
    login
} = require("../services/authService");

// ======================
// LOGIN
// ======================

router.post("/login", async (req, res) => {

    try {

        const {
            username,
            password
        } = req.body;

        const result = await login(username, password);

        if (result.error) {
            return res.status(401).json(result);
        }

        req.session.user = {

            id: result.user.id,

            username: result.user.username,

            role: result.user.role

        };

        return res.json({

            success: true,

            user: req.session.user

        });

    } catch (err) {

        console.log(err);

        return res.status(500).json({

            error: true,

            message: err.message

        });

    }

});

// ======================
// CHECK LOGIN
// ======================

router.get("/me", (req, res) => {

    if (!req.session.user) {

        return res.status(401).json({

            error: true

        });

    }

    return res.json({

        success: true,

        user: req.session.user

    });

});

// ======================
// LOGOUT
// ======================

router.post("/logout", (req, res) => {

    req.session.destroy(err => {

        if (err) {

            return res.status(500).json({

                error: true,

                message: "Logout failed"

            });

        }

        res.clearCookie("connect.sid");

        return res.json({

            success: true

        });

    });

});

module.exports = router;