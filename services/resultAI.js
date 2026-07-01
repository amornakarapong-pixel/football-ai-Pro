const Groq = require("groq-sdk");

const config = require("../config");

const groq = new Groq({

    apiKey: config.GROQ_KEY

});

async function checkResult(match){

    const prompt = `

ตรวจผลการแข่งขันฟุตบอล

${match.home} vs ${match.away}

ตอบ JSON เท่านั้น

{
"winner":"",
"homeScore":0,
"awayScore":0
}

`;

    const res = await groq.chat.completions.create({

        model:"llama-3.3-70b-versatile",

        temperature:0,

        messages:[

            {

                role:"user",

                content:prompt

            }

        ]

    });

    let text = res.choices[0].message.content;

    text = text

        .replace(/```json/g,"")

        .replace(/```/g,"")

        .trim();

    const start = text.indexOf("{");

    const end = text.lastIndexOf("}");

    const json = text.substring(start,end+1);

    return JSON.parse(json);

}

module.exports = {

    checkResult

};