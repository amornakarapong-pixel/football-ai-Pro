const express = require("express");

const router = express.Router();

const {

    getHistory,

    clearHistory,

    deleteHistory

} = require("../services/historyService");

// ====================================
// HISTORY
// ====================================

router.get("/", async (req, res) => {

    if (!req.session.user) {

        return res.status(401).json({

            error: true,

            message: "Unauthorized"

        });

    }

    try {

        const history = await getHistory(req.session.user.id);

        const result = history.map(item => ({

            id: item.id,

            date: item.date,

            home: item.home,

            away: item.away,

            pick: item.pick,

            recommendation: item.recommendation,

            mainBet: item.mainbet,

            stars: item.stars,

            analysis: item.analysis,

            reasons: item.reasons,

            confidence: item.confidence,

            probability: item.probability,

            fairOdds: item.fairodds,

            value: item.value,

            risk: item.risk,

            marketsRating: item.marketsrating,

            stakeUnits: item.stakeunits,

            result: item.result,

            status: item.status

        }));

        return res.json({

            count: result.length,

            data: result

        });

    }

    catch (err) {

        console.log(err);

        return res.status(500).json({

            error: true,

            message: err.message

        });

    }

});

// ====================================
// DELETE ONE
// ====================================

router.post("/delete/:id", async (req, res) => {

    if (!req.session.user) {

        return res.status(401).json({

            error: true,

            message: "Unauthorized"

        });

    }

    try {

        const history = await getHistory(req.session.user.id);

        const item = history.find(x => x.id == req.params.id);

        if (!item) {

            return res.status(404).json({

                error: true,

                message: "History not found"

            });

        }

        await deleteHistory(

            req.params.id,

            req.session.user.id

        );

        return res.json({

            success: true

        });

    }

    catch (err) {

        console.log(err);

        return res.status(500).json({

            error: true,

            message: err.message

        });

    }

});

// ====================================
// CLEAR HISTORY
// ====================================

router.post("/clear", async (req, res) => {

    if (!req.session.user) {

        return res.status(401).json({

            error: true,

            message: "Unauthorized"

        });

    }

    try {

        await clearHistory(req.session.user.id);

        return res.json({

            success: true

        });

    }

    catch (err) {

        console.log(err);

        return res.status(500).json({

            error: true,

            message: err.message

        });

    }

});

module.exports = router;