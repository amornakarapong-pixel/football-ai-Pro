const express = require("express");

const router = express.Router();

console.log("RESULT ROUTES LOADED");

const {
    getById,
    updateResult
} = require("../services/historyService");

const {
    checkResult
} = require("../services/resultAI");

// ========================================
// AUTO RESULT
// ========================================

router.post("/check/:id", async (req,res)=>{

    try{

        const record = await getById(req.params.id);

        if(!record){

            return res.status(404).json({

                error:true,

                message:"History not found"

            });

        }

        const result = await checkResult(record);

        let winner = "DRAW";

        if(result.homeScore > result.awayScore){

            winner = "HOME";

        }

        else if(result.awayScore > result.homeScore){

            winner = "AWAY";

        }

        const bet = (record.mainBet || "").trim();

        let status = "lose";

        if(

            bet.includes("เจ้าบ้านชนะ") &&
            winner==="HOME"

        ){

            status="win";

        }

        else if(

            bet.includes("ทีมเยือนชนะ") &&
            winner==="AWAY"

        ){

            status="win";

        }

        else if(

            bet.includes("เสมอ") &&
            winner==="DRAW"

        ){

            status="win";

        }

        await updateResult(

            record.id,

            JSON.stringify(result),

            status

        );

        return res.json({

            success:true,

            result,

            status

        });

    }

    catch(err){

        console.log(err);

        return res.status(500).json({

            error:true,

            message:err.message

        });

    }

});

// ========================================
// MANUAL RESULT
// ========================================

router.post("/manual", async(req,res)=>{

    console.log("MANUAL API HIT");

    const {

        id,

        homeScore,

        awayScore

    } = req.body;

    const record = await getById(id);

    if(!record){

        return res.status(404).json({

            error:true,

            message:"Match not found"

        });

    }

    let winner="DRAW";

    if(homeScore>awayScore){

        winner="HOME";

    }

    else if(awayScore>homeScore){

        winner="AWAY";

    }

   console.log(record);

const bet =
(
    record.mainBet ||
    record.mainbet ||
    ""
).trim();


console.log("========== MANUAL CHECK ==========");
console.log("MAIN BET =", record.mainBet);
console.log("BET =", bet);
console.log("WINNER =", winner);
console.log("HOME SCORE =", homeScore);
console.log("AWAY SCORE =", awayScore);
console.log("==================================");

let status = "lose";

if(

    bet.includes("เจ้าบ้านชนะ")

    &&

    winner==="HOME"

){

    status="win";

}

else if(

    bet.includes("ทีมเยือนชนะ")

    &&

    winner==="AWAY"

){

    status="win";

}

else if(

    bet.includes("เสมอ")

    &&

    winner==="DRAW"

){

    status="win";

}

console.log("STATUS =", status);

    await updateResult(

    record.id,

    `${homeScore}-${awayScore}`,

    status

);

});

module.exports = router;