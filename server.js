// =================================================
// FOOTBALL AI PRO
// PART 1
// CORE SERVER
// =================================================

const express = require("express");
const cors = require("cors");
const session = require("express-session");

const config = require("./config");

const { createDefaultAdmin } = require("./services/authService");
const { initDatabase } = require("./database/db");

const app = express();

const odds = require("./odds/oddsService");

const historyRoutes = require("./routes/historyRoutes");
const resultRoutes = require("./routes/resultRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({

    secret: "football-ai-secret",

    resave: false,

    saveUninitialized: false,

    cookie: {

        maxAge: 1000 * 60 * 60 * 24

    }

}));

app.use(express.static("public"));

app.use("/api/history", historyRoutes);
app.use("/api/result", resultRoutes);
console.log("RESULT ROUTE REGISTERED");

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// ===============================
// KEY CHECK
// ===============================

function checkKeys() {

    if (!config.GROQ_KEY) {

        console.log("❌ GROQ KEY MISSING");
        return false;

    }

    if (!config.ODDS_KEY) {

        console.log("❌ ODDS KEY MISSING");
        return false;

    }

    return true;

}

// ===============================
// STATUS
// ===============================

app.get("/api/status", (req, res) => {

    res.json({

        system: "ONLINE",

        groq: config.GROQ_KEY ? "READY" : "ERROR",

        odds: config.ODDS_KEY ? "READY" : "ERROR"

    });

});

// ===============================
// REAL LEAGUES
// ===============================

app.get("/api/leagues", async (req, res) => {

    try {

        let data = await odds.getLeagues();

        res.json({

            count: data.length,

            data: data.map(x => ({

                key: x.key,

                name: x.title,

                group: x.group

            }))

        });

    } catch (e) {

        console.log("LEAGUE ERROR", e.message);

        res.status(500).json({

            count: 0,

            data: []

        });

    }

});

// ===============================
// REAL MATCHES
// ===============================

app.get("/api/matches/:league", async (req, res) => {

    try {

        let result = await odds.getMatches(req.params.league);

        res.json({

            count: result.length,

            data: result

        });

    } catch (e) {

        console.log(e.message);

        res.status(500).json([]);

    }

});

// ===============================
// AI ANALYSIS
// ===============================

const { analyzeAI } = require("./ai/analyzer");

const { saveHistory } = require("./services/historyService");

app.post("/api/analyze", async (req, res) => {

    console.log("API ANALYZE HIT", req.body.home, req.body.away);

    try {

        const result = await analyzeAI(req.body);

        if (req.session.user) {

            await saveHistory(req.session.user.id, result);

        }

        console.log("AI RESULT READY");

        return res.json(result);

    } catch (e) {

        console.log("AI ERROR", e.message);

        return res.status(500).json({

            error: true,

            message: e.message

        });

    }

});

// ===============================
// START
// ===============================

(async () => {

    try {

        checkKeys();

        await initDatabase();

        await createDefaultAdmin();

        app.listen(config.PORT, () => {

            console.log(`

================================

⚽ Football AI PRO

SERVER:
ONLINE

DATABASE:
POSTGRES READY

GROQ:
${config.GROQ_KEY ? "READY" : "ERROR"}

ODDS:
${config.ODDS_KEY ? "READY" : "ERROR"}

================================

`);

        });

    } catch (err) {

        console.error("DATABASE ERROR");
        console.error(err);

    }

})();