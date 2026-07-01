// ======================================
// FOOTBALL AI PRO
// FRONTEND ENGINE
// PART 6
// ======================================


let currentLeague = "";

let matchCache = {};

const bankroll = 10000;
// ================================
// INIT
// ================================

window.onload = ()=>{

loadStatus();

loadLeagues();

};



// ================================
// STATUS
// ================================


async function loadStatus(){


let res =
await fetch("/api/status");


let data =
await res.json();



let box =
document.getElementById("status");


if(box){

box.innerHTML =
`
SYSTEM:
${data.system}
<br>
GROQ:
${data.groq}
<br>
ODDS:
${data.odds}
`;

}


}





// ================================
// LOAD LEAGUES
// ================================


async function loadLeagues(){


let box =
document.getElementById(
"leagueList"
);


box.innerHTML =
"⏳ กำลังโหลดลีก...";


try{


let res =
await fetch("/api/leagues");


let json =
await res.json();


console.log(
"MATCH RESPONSE",
json
);


renderMatches(
json.data || []
);


console.log(
"LEAGUES:",
json
);



let leagues =
json.data || [];



box.innerHTML="";



leagues.forEach(l=>{


let btn =
document.createElement("button");


btn.innerHTML =
l.name;



btn.onclick=()=>{


selectLeague(
l.key,
l.name
);


};



box.appendChild(btn);



});



}catch(e){


console.log(
"LEAGUE FRONT ERROR",
e
);


box.innerHTML =
"โหลดลีกผิดพลาด";


}


}






// ================================
// SELECT LEAGUE
// ================================


async function selectLeague(
key,
name
){


currentLeague =
key;



let matchBox =
document.getElementById(
"matchList"
);



matchBox.innerHTML =
`
กำลังโหลด ${name}
...
`;



let res =
await fetch(
"/api/matches/"
+
key
);



let json =
await res.json();



renderMatches(
json.data || []
);



}






// ================================
// RENDER MATCHES
// ================================


function renderTotals(market){


if(!market)return "-";


return market.outcomes.map(o=>`

<span>

${o.name}

${o.point}

:

<b>${o.price}</b>


</span>


`).join("<br>");

}

function renderHandicap(market){


if(!market)return "ไม่มี Handicap";


return market.outcomes.map(o=>`

<span>

${o.name}

${o.point}

:

<b>${o.price}</b>


</span>


`).join("<br>");

}


function renderH2H(market){


if(!market)return "-";


return market.outcomes.map(o=>`

<span>

${o.name} :

<b>
${o.price}
</b>

</span>

`).join("<br>");

}

function renderMatches(
matches
){

console.log(
"MATCH DATA",
matches[0]
);

let box =
document.getElementById(
"matchList"
);


box.innerHTML="";


matchCache = {};



matches.forEach(m=>{


if(!m.home || !m.away){

console.log(
"BAD MATCH",
m
);

return;

}



matchCache[m.id]=m;


box.innerHTML +=
`

<div class="card">


<h2>
⚽ ${m.home}
VS
${m.away}
</h2>


<p>
🕒 ${new Date(m.time).toLocaleString()}
</p>



<div class="odds-box">


<h3>💰 1X2</h3>

<div>
${renderH2H(m.markets?.h2h)}
</div>



<h3>📈 Handicap</h3>

<div>
${renderHandicap(m.markets?.handicap)}
</div>



<h3>⚽ Over / Under</h3>

<div>
${renderTotals(m.markets?.totals)}
</div>



</div>



<button 
class="ai-btn"
data-id="${m.id}">
🤖 วิเคราะห์ AI
</button>


<div 
class="analysisBox"
id="analysis-${m.id}">

รอ AI วิเคราะห์...

</div>



</div>

`;



});

document
.querySelectorAll(".ai-btn")
.forEach(btn=>{


btn.onclick = ()=>{

console.log(
"BUTTON CLICK",
btn.dataset.id
);


let id =
btn.getAttribute("data-id");


analyzeMatchById(id);


};


});


}





function analyzeMatchById(id){

console.log(
"ANALYZE ID",
id
);


let match =
matchCache[id];


if(!match){

alert(
"ไม่พบข้อมูลคู่แข่ง"
);

return;

}


analyzeMatch(match);


}



// ================================
// AI BUTTON
// ================================


async function analyzeMatch(
match
){

console.log(
"ANALYZE MATCH",
match
);


let box =
document.querySelector(
"#analysis-"+match.id
);


console.log(
"BOX:",
box
);


if(!box){

alert(
"หา analysisBox ไม่เจอ"
);

return;

}



box.innerHTML =
"🤖 AI กำลังวิเคราะห์...";



let res =
await fetch(
"/api/analyze",
{


method:"POST",


headers:{

"Content-Type":
"application/json"

},


body:
JSON.stringify(match)


});



let text =
await res.text();

let ai;

try{

ai =
JSON.parse(text);

}catch(e){

ai = {

pick:"WAIT",

stars:0,

confidence:0,

probability:0,

value:0,

risk:"ERROR",

analysis:text,

reasons:[]

};

}

console.log(
"AI DISPLAY",
ai
);

let html =

`

<h2>🔥 ${ai.pick || "-"}</h2>

<h3 style="color:#ffd700">
🎯 ทีเด็ดหลัก
</h3>

<p style="font-size:22px;font-weight:bold;color:#00ff99">
${ai.mainBet || "-"}
</p>

<h3>
⭐ ความมั่นใจ
</h3>

<p style="font-size:24px">
${showStars(ai.stars)}
</p>

<hr>
<hr>

<h3>
💰 ขนาดเดิมพัน
</h3>

const suggestedStake =

(bankroll * 0.01)
*
(currentAI?.stakeUnits || 0);

<p>

${"⭐".repeat(ai.stars || 0)}

</p>

<hr>

<h3>

📊 สถิติ AI

</h3>

<p>

Confidence:
${(ai.confidence*100).toFixed(0)}%

</p>

<p>

Probability:
${(ai.probability*100).toFixed(0)}%

</p>

<p>

Value:
${ai.value || 0}%

</p>

<p>

Risk:
${ai.risk || "-"}

</p>

<h3>📊 คะแนนแต่ละตลาด</h3>

<p>
🏠 เหย้า:
${showStars(ai.marketsRating?.home)}
</p>

<p>
🤝 เสมอ:
${showStars(ai.marketsRating?.draw)}
</p>

<p>
✈️ เยือน:
${showStars(ai.marketsRating?.away)}
</p>

<p>
⚽ สูง:
${showStars(ai.marketsRating?.over)}
</p>

<p>
⬇️ ต่ำ:
${showStars(ai.marketsRating?.under)}
</p>

<p>
📈 Handicap:
${showStars(ai.marketsRating?.handicap)}
</p>

<hr>

<h3>

💰 ราคา 1X2

</h3>

<p>

🏠 ${match.home}

:
${match.markets?.h2h?.outcomes?.[0]?.price || "-"}

</p>

<p>

🤝 Draw

:
${match.markets?.h2h?.outcomes?.[2]?.price || "-"}

</p>

<p>

✈️ ${match.away}

:
${match.markets?.h2h?.outcomes?.[1]?.price || "-"}

</p>

<hr>

<h3>

📈 Handicap

</h3>

<pre>

${
match.markets?.handicap
?
JSON.stringify(
match.markets.handicap.outcomes,
null,
2
)
:
"ไม่มี Handicap"
}

</pre>

<hr>

<h3>

⚽ Over / Under

</h3>

<pre>

${
match.markets?.totals
?
JSON.stringify(
match.markets.totals.outcomes,
null,
2
)
:
"ไม่มี Over/Under"
}

</pre>

<hr>

<h3>

📋 บทวิเคราะห์

</h3>

<p>

${ai.analysis || ""}

</p>

<hr>

<h3>

📌 เหตุผล

</h3>

<ul>

${
(ai.reasons || [])
.map(x=>`<li>${x}</li>`)
.join("")
}

</ul>

`;
currentAI = ai;

openModal("");

showTab("tip");


}

// =====================================
// POPUP
// =====================================

function openModal(html){

const modal =
document.getElementById("aiModal");

const body =
document.getElementById("modalBody");

body.innerHTML = html;

modal.style.display = "block";

}


function closeModal(){

document.getElementById(
"aiModal"
).style.display="none";

}


document.addEventListener(
"click",
(e)=>{

if(
e.target.id==="closeModal"
){

closeModal();

}

});




let currentAI = null;

function showTab(type){
const suggestedStake =

(bankroll * 0.01)
*
(currentAI.stakeUnits || 0);
if(!currentAI) return;

const body =
document.getElementById("modalBody");

if(type==="tip"){

const rankings = [

{
name:"🏠 เหย้า",
star:currentAI.marketsRating?.home || 0
},

{
name:"🤝 เสมอ",
star:currentAI.marketsRating?.draw || 0
},

{
name:"✈️ เยือน",
star:currentAI.marketsRating?.away || 0
},

{
name:"⚽ สูง",
star:currentAI.marketsRating?.over || 0
},

{
name:"⬇️ ต่ำ",
star:currentAI.marketsRating?.under || 0
},

{
name:"📈 Handicap",
star:currentAI.marketsRating?.handicap || 0
}

].sort((a,b)=>b.star-a.star);

body.innerHTML = `

<p style="
font-size:24px;
font-weight:bold;
color:${
currentAI.recommendation==="BET"
? "#00ff66"
:
currentAI.recommendation==="SMALL BET"
? "#ffd700"
:
"#ff4444"
};
">
${currentAI.recommendation || "WAIT"}
</p>

<h2>
🔥 ${currentAI.pick || "-"}
</h2>

<h3>
🎯 ทีเด็ดหลัก
</h3>

<p style="
font-size:20px;
font-weight:bold;
color:#ffffff;
">
${currentAI.mainBet || "-"}
</p>
<hr>

<h3>
🏆 อันดับความน่าเล่น
</h3>

<p>

1️⃣
${rankings[0]?.name}
${showStars(rankings[0]?.star)}

</p>

<p>

2️⃣
${rankings[1]?.name}
${showStars(rankings[1]?.star)}

</p>

<p>

3️⃣
${rankings[2]?.name}
${showStars(rankings[2]?.star)}

</p>

<h3>
⭐ ความมั่นใจ
</h3>

<p>
${showStars(currentAI.stars)}
</p>

<hr>

<h3>
📈 VALUE METER
</h3>

<div style="
width:100%;
height:25px;
background:#222;
border-radius:10px;
overflow:hidden;
">

<div style="
width:${Math.min(
(currentAI.probability||0)*100,
100
)}%;
height:100%;
background:#00ff66;
">

</div>

</div>

<p>

${Math.round(
(currentAI.probability||0)*100
)}%

</p>
`;

}

if(type==="analysis"){

body.innerHTML = `

<h3>
📋 บทวิเคราะห์
</h3>

<div style="
line-height:1.8;
font-size:15px;
text-align:left;
">

${currentAI.analysis}

</div>

<h3>
📌 เหตุผล
</h3>

<ul>

${
(currentAI.reasons||[])
.map(x=>`<li>${x}</li>`)
.join("")
}

</ul>

`;

}



if(type==="odds"){

body.innerHTML = `

<h3>
📊 คะแนนแต่ละตลาด
</h3>

<p>
🏠 เหย้า:
${showStars(currentAI.marketsRating?.home)}
</p>

<p>
🤝 เสมอ:
${showStars(currentAI.marketsRating?.draw)}
</p>

<p>
✈️ เยือน:
${showStars(currentAI.marketsRating?.away)}
</p>

<p>
⚽ สูง:
${showStars(currentAI.marketsRating?.over)}
</p>

<p>
⬇️ ต่ำ:
${showStars(currentAI.marketsRating?.under)}
</p>

<p>
📈 Handicap:
${showStars(currentAI.marketsRating?.handicap)}
</p>

`;

}

}


function showStars(n){

    n = parseInt(n,10);

    if (isNaN(n)) n = 0;

    if (n < 0) n = 0;

    if (n > 5) n = 5;

    return `
        <span style="color:#FFD700;letter-spacing:2px;">
            ${"⭐".repeat(n)}
        </span>
        <span style="color:#666;letter-spacing:2px;">
            ${"☆".repeat(5-n)}
        </span>
    `;

}