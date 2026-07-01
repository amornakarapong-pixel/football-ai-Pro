const { pool } = require("../database/db");

// =========================
// SAVE / UPDATE HISTORY
// =========================

async function saveHistory(userId, record){

    console.log("SAVE HISTORY");
    console.log(record);

    const old = await pool.query(

        `
        SELECT id
        FROM history
        WHERE user_id=$1
        AND home=$2
        AND away=$3
        `,

        [
            userId,
            record.home,
            record.away
        ]

    );

    if(old.rows.length){

        const id = old.rows[0].id;

        await pool.query(

            `
            UPDATE history

            SET

                date=$1,

                pick=$2,

                recommendation=$3,

                mainBet=$4,

                stars=$5,

                analysis=$6

            WHERE id=$7
            `,

            [

                record.date,

                record.pick,

                record.recommendation,

                record.mainBet,

                record.stars,

                record.analysis,

                id

            ]

        );

        return id;

    }

    const result = await pool.query(

        `
        INSERT INTO history(

            user_id,

            date,

            home,

            away,

            pick,

            recommendation,

            mainBet,

            stars,

            analysis,

            result,

            status

        )

        VALUES(

            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11

        )

        RETURNING id
        `,

        [

            userId,

            record.date,

            record.home,

            record.away,

            record.pick,

            record.recommendation,

            record.mainBet,

            record.stars,

            record.analysis,

            record.result || null,

            record.status || "pending"

        ]

    );

    return result.rows[0].id;

}

// =========================
// GET BY ID
// =========================

async function getById(id){

    const result = await pool.query(

        `
        SELECT *
        FROM history
        WHERE id=$1
        `,

        [id]

    );
    
console.log("===== RECORD FROM DB =====");
console.log(result.rows[0]);

    return result.rows[0];

}

// =========================
// GET HISTORY
// =========================

async function getHistory(userId){

    const result = await pool.query(

        `
        SELECT *

        FROM history

        WHERE user_id=$1

        ORDER BY id DESC
        `,

        [userId]

    );

    return result.rows;

}

// =========================
// GET BY DATE
// =========================

async function getByDate(date){

    const result = await pool.query(

        `
        SELECT *

        FROM history

        WHERE date=$1
        `,

        [date]

    );

    return result.rows[0];

}

// =========================
// UPDATE RESULT
// =========================

async function updateResult(id,result,status){

    await pool.query(

        `
        UPDATE history

        SET

            result=$1,

            status=$2

        WHERE id=$3
        `,

        [

            result,

            status,

            id

        ]

    );

}

// =========================
// CLEAR
// =========================

async function clearHistory(userId){

    await pool.query(

        `
        DELETE FROM history
        WHERE user_id=$1
        `,

        [userId]

    );

}

// =========================
// DELETE ONE
// =========================

async function deleteHistory(id,userId){

    await pool.query(

        `
        DELETE FROM history

        WHERE id=$1

        AND user_id=$2
        `,

        [

            id,

            userId

        ]

    );

}
module.exports = {

    saveHistory,

    getHistory,

    clearHistory,

    deleteHistory,

    getByDate,

    getById,

    updateResult

};