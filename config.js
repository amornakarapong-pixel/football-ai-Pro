require("dotenv").config();


module.exports = {


PORT:
process.env.PORT || 3000,


GROQ_KEY:
process.env.GROQ_API_KEY,


ODDS_KEY:
process.env.ODDS_API_KEY


};