const Groq =
require("groq-sdk");


const config =
require("../config");
const {
saveHistory
}
=
require("../services/historyService");

const groq =
new Groq({

apiKey:
config.GROQ_KEY

});



async function analyzeAI(match){



const prompt = `

คุณคือ AI Value Betting ระดับโลก

วิเคราะห์ฟุตบอลจากข้อมูลจริงเท่านั้น

กติกา:
กติกาการวิเคราะห์:

- วิเคราะห์ละเอียดประมาณ 600 ตัวอักษร
- อธิบายเหตุผลเชิงฟุตบอล
- วิเคราะห์ฟอร์ม
- วิเคราะห์ความได้เปรียบ
- วิเคราะห์ราคา Value
- ห้ามแต่งข้อมูล
- ใช้เฉพาะข้อมูล Odds ที่ได้รับ
- ถ้าไม่มีข้อมูลให้แจ้งว่าไม่มีข้อมูล
- ห้ามสร้างราคาเอง
- ใช้เฉพาะ Odds API ที่ส่งมา
- ถ้าไม่มีข้อมูลให้ตอบ null
- วิเคราะห์ตาม 1X2, Handicap, Over/Under
ให้คะแนนความมั่นใจ 1-5 ดาว

5 = มั่นใจมาก
4 = ดี
3 = กลาง
2 = เสี่ยง
1 = หลีกเลี่ยง


ให้ประเมิน:

- เจ้าบ้าน
- เสมอ
- ทีมเยือน
- สูง
- ต่ำ
- Handicap


ห้ามเดาราคา
ใช้ข้อมูล Odds API เท่านั้น
recommendation ต้องเป็น

"BET"
หรือ
"SMALL BET"
หรือ
"WAIT"

BET = น่าเล่นมาก

SMALL BET = เล่นได้แต่ไม่สุด

WAIT = ควรหลีกเลี่ยง



คู่แข่งขัน:



${match.home}
vs
${match.away}


ราคา:

${JSON.stringify(match.markets)}

เลือกทีเด็ดหลักเพียง 1 รายการ

mainBet ต้องเป็น

"เจ้าบ้านชนะ"

หรือ

"ทีมเยือนชนะ"

หรือ

"เสมอ"

หรือ

"ต่อ -0.5"

หรือ

"รอง +0.5"

หรือ

"สูง 2.5"

หรือ

"ต่ำ 2.5"

เลือกตลาดที่ดีที่สุดเพียง 1 ตลาด

analysis ต้องมีความยาวอย่างน้อย 600 ตัวอักษร

แบ่งเป็น

1. ฟอร์มทีม
2. จุดแข็งจุดอ่อน
3. วิเคราะห์ราคา
4. ความเสี่ยง
5. สรุปการเดิมพัน

กำหนด recommendation

BET = 4-5 ดาว

SMALL BET = 3 ดาว

WAIT = 1-2 ดาว

กำหนด mainBet

ตัวอย่าง

"เจ้าบ้านชนะ"

"รอง +0.5"

"สูง 2.5"

"ต่ำ 2.5"

"ไม่ควรเดิมพัน"

กำหนด stakeUnits

5 ดาว = 5

4 ดาว = 3

3 ดาว = 2

2 ดาว = 1

1 ดาว = 0

ตอบ JSON เท่านั้น


{
pick:"",

recommendation:"",

mainBet:"",

confidence:0,

probability:0,

fairOdds:0,

value:0,

risk:"",

stars:0,

marketsRating:{

home:0,
draw:0,
away:0,
over:0,
under:0,
handicap:0
ev:0
},

analysis:"",
reasons:[]
}
`;



console.log(
"GROQ REQUEST START"
);



const result =

await groq.chat.completions.create({


model:
"llama-3.3-70b-versatile",


temperature:
0.05,


max_tokens:
800,


messages:[

{
role:"system",
content:
"ตอบ JSON เท่านั้น"
},


{
role:"user",
content:prompt
}

],




});



console.log(
"GROQ RESPONSE OK"
);


let text =
result.choices[0]
.message
.content;

console.log(
"GROQ RAW =",
text
);



text =
text
.replace(/```json/g,"")
.replace(/```/g,"")
.trim();



try{

text = text
.replace(/```json/g,"")
.replace(/```/g,"")
.trim();

const start = text.indexOf("{");
const end = text.lastIndexOf("}");

let jsonText =
text.substring(
start,
end + 1
);

// แก้ newline ใน analysis
jsonText =
jsonText.replace(
/"analysis"\s*:\s*"([\s\S]*?)"/,
(_,content)=>{

return `"analysis":"${
content
.replace(/\r/g,"")
.replace(/\n/g," ")
.replace(/"/g,'\\"')
}"`;

}
);

const output = JSON.parse(jsonText);

console.log("MAIN BET FROM AI =", output.mainBet);

await saveHistory(1,{

    date:new Date(),

    home:match.home,

    away:match.away,

    pick:output.pick,

    recommendation:output.recommendation,

    mainBet:output.mainBet,

    stars:output.stars,

    analysis:output.analysis,

    result:null,

    status:"pending"

});

console.log("===== AI OUTPUT =====");
console.log(output);
console.log("===== MARKETS =====");
console.log(output.marketsRating);

return {

    date:new Date(),

    home:match.home,

    away:match.away,

    pick:output.pick,

    recommendation:output.recommendation,

    mainBet:output.mainBet,

    stars:output.stars,

    analysis:output.analysis,

    result:null,

    status:"pending",

    confidence:output.confidence,

    probability:output.probability,

    fairOdds:output.fairOdds,

    value:output.value,

    risk:output.risk,

    marketsRating:output.marketsRating,

    reasons:output.reasons,

    stakeUnits:output.stakeUnits

};

}

catch(e){

  console.log("FULL ERROR");
  console.log(e);
  console.log(e.stack);

  return {
    pick:"WAIT",
    confidence:0,
    probability:0,
    value:0,
    risk:"ERROR",
    analysis:e.message
  };

}



}



module.exports = {

analyzeAI: analyzeAI

};