async function loadHistory(){

    const res = await fetch("/api/history");

    const json = await res.json();

    const history = json.data || [];

    let win = 0;
    let lose = 0;
    let pending = 0;

    history.forEach(x=>{

        if(x.status==="win") win++;

        else if(x.status==="lose") lose++;

        else pending++;

    });

    const total = history.length;

    const accuracy =
    (win+lose)
    ?
    ((win/(win+lose))*100).toFixed(1)
    :
    0;

    document.getElementById("historyStats").innerHTML=`

<div class="statCard">
<div class="statTitle">📊 วิเคราะห์ทั้งหมด</div>
<div class="statValue">${total}</div>
</div>

<div class="statCard">
<div class="statTitle">🟢 WIN</div>
<div class="statValue">${win}</div>
</div>

<div class="statCard">
<div class="statTitle">🔴 LOSE</div>
<div class="statValue">${lose}</div>
</div>

<div class="statCard">
<div class="statTitle">🟠 Pending</div>
<div class="statValue">${pending}</div>
</div>

<div class="statCard">
<div class="statTitle">🎯 Accuracy</div>
<div class="statValue">${accuracy}%</div>
</div>

<div class="statCard">
<div class="statTitle">⭐ AI PICKS</div>
<div class="statValue">${total}</div>
</div>

`;

    renderHistory(history);

    drawChart(win,lose,pending);

}

function renderHistory(data){

    const keyword =
    document.getElementById("searchBox").value.toLowerCase();

    const filter =
    document.getElementById("filterStatus").value;

    const list =
    document.getElementById("historyList");

    list.innerHTML="";

    data
    .filter(x=>{

        let ok=true;

        if(keyword){

            ok=
            x.home.toLowerCase().includes(keyword)
            ||
            x.away.toLowerCase().includes(keyword);

        }

        if(filter!=="all"){

            ok=
            ok
            &&
            x.status===filter;

        }

        return ok;

    })

    .forEach(x=>{

        let cls="pending";

        if(x.status==="win") cls="win";

        if(x.status==="lose") cls="lose";

        const probability =
        Math.round((x.probability||0)*100);

        list.innerHTML+=`

<div class="historyCard ${cls}">

<div class="matchTitle">

⚽ ${x.home}

<span style="color:#64748b;">VS</span>

${x.away}

</div>

<div class="badges">

<span class="badge">

🎯 ${x.mainBet}

</span>

<span class="badge">

🔥 ${x.pick}

</span>

<span class="badge">

⭐ ${showStars(x.stars)}

</span>

</div>

<div class="status ${cls}">

${x.status.toUpperCase()}

</div>

<div style="margin-top:18px;">

<div style="display:flex;justify-content:space-between;">

<div>

Probability

</div>

<div>

${probability}%

</div>

</div>

<div class="progress">

<div style="width:${probability}%"></div>

</div>

</div>

<div class="analysisBox">

${x.analysis||"-"}

</div>

<div style="margin-top:18px;color:#94a3b8;">

📅

${new Date(x.date).toLocaleString("th-TH")}

</div>

<div class="actionBar">

<button
class="checkBtn"
onclick="checkResult('${x.id}')">

🔍 ตรวจผล

</button>

<button
class="analysisBtn"
onclick="viewAnalysis(${JSON.stringify(x).replace(/"/g,"&quot;")})">

📋 ดูบทวิเคราะห์

</button>

<button
class="deleteBtn"
onclick="deleteHistory('${x.id}')">

🗑 ลบ

</button>

</div>

</div>

`;

    });

}

function showStars(n){

    n=Number(n)||0;

    return "⭐".repeat(n)+"☆".repeat(5-n);

}

let chart=null;

function drawChart(win,lose,pending){

    const ctx=
    document.getElementById("historyChart");

    if(chart){

        chart.destroy();

    }

    chart=new Chart(ctx,{

        type:"doughnut",

        data:{

            labels:[
            "WIN",
            "LOSE",
            "Pending"
            ],

            datasets:[{

                data:[
                win,
                lose,
                pending
                ],

                backgroundColor:[
                "#22c55e",
                "#ef4444",
                "#f59e0b"
                ],

                borderWidth:0

            }]

        },

        options:{

            plugins:{

                legend:{

                    labels:{
                        color:"#fff"
                    }

                }

            }

        }

    });

}

document
.getElementById("searchBox")
.addEventListener("keyup",loadHistory);

document
.getElementById("filterStatus")
.addEventListener("change",loadHistory);

document
.getElementById("clearBtn")
.onclick=async()=>{

if(!confirm("ล้างทั้งหมด ?")) return;

await fetch("/api/history/clear",{

method:"POST"

});

loadHistory();

};

async function checkResult(id){

    const homeScore = prompt("ประตูทีมเจ้าบ้าน");

    if(homeScore===null) return;

    const awayScore = prompt("ประตูทีมเยือน");

    if(awayScore===null) return;

    const res = await fetch("/api/result/manual",{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({

            id,

            homeScore:Number(homeScore),

            awayScore:Number(awayScore)

        })

    });

    const result = await res.json();

    if(result.success){

        alert("บันทึกผลเรียบร้อย");

        loadHistory();

    }else{

        alert(result.message || "เกิดข้อผิดพลาด");

    }

}
async function deleteHistory(id){

if(!confirm("ลบรายการนี้ ?")) return;

await fetch(

"/api/history/delete/"

+

encodeURIComponent(id),

{

method:"POST"

}

);

loadHistory();

}

loadHistory();

function viewAnalysis(item){

    currentAI = {

        recommendation : item.recommendation,

        pick : item.pick,

        mainBet : item.mainBet,

        stars : item.stars,

        probability : item.probability,

        confidence : item.confidence,

        value : item.value,

        risk : item.risk,

        analysis : item.analysis,

        reasons : item.reasons || [],

        marketsRating : item.marketsRating || {}

    };

    openModal("");

    showTab("tip");

}