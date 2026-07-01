// =================================================
// FOOTBALL AI PRO
// ODDS SERVICE
// PART 2 FIX
// =================================================


const config =
require("../config");




// ==============================
// GET ALL SOCCER LEAGUES
// ==============================


async function getLeagues(){


const url =

"https://api.the-odds-api.com/v4/sports/?apiKey="
+
config.ODDS_KEY;



const response =
await fetch(url);



const data =
await response.json();



console.log(
"ODDS SPORTS:",
Array.isArray(data)
?
data.length
:
data
);



if(!Array.isArray(data)){

throw new Error(
JSON.stringify(data)
);

}



// ==============================
// FILTER REAL SOCCER ONLY
// ==============================


console.log(
"SOCCER FILTER START"
);



let soccer = data.filter(x =>


x.active === true

&&

(
x.sport_key?.startsWith("soccer")
||
x.key?.startsWith("soccer")
)


);



console.log(
"SOCCER COUNT:",
soccer.length
);



return soccer;


}









// ==============================
// GET MATCHES
// ==============================


async function getMatches(
sportKey
){


const url =


"https://api.the-odds-api.com/v4/sports/"

+

sportKey

+

"/odds/?apiKey="

+

config.ODDS_KEY

+

"&regions=uk&markets=h2h,spreads,totals";





const response =
await fetch(url);



const data =
await response.json();




if(!Array.isArray(data)){


throw new Error(
JSON.stringify(data)
);


}



return data.map(normalizeMatch);



}









// ==============================
// CLEAN MARKET DATA
// ==============================


function normalizeMatch(match){


let markets = {

h2h:null,
handicap:null,
totals:null

};


match.bookmakers?.forEach(book=>{


book.markets?.forEach(m=>{


if(m.key==="h2h")
markets.h2h=m;


if(m.key==="spreads")
markets.handicap=m;


if(m.key==="totals")
markets.totals=m;


});


});



return {


id:match.id,


home:match.home_team,


away:match.away_team,


time:match.commence_time,


markets:markets


};


}


module.exports={


getLeagues,

getMatches,

normalizeMatch


};

