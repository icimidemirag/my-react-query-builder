const mongoose = require('mongoose');
const Deneme = require('./Deneme');
//------------------------------

const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const { send } = require('process');
require('dotenv').config();
const { Pool, types } = require('pg');
const { formatQuery } = require("react-querybuilder");
const { processSQL } = require("./processSQL");
const cors = require("cors");

const PORT = process.env.PORT || 3000;
const DEV_MODE = process.env.NODE_ENV === "true";

types.setTypeParser(1700, val => parseFloat(val));

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: DEV_MODE ? false : { rejectUnauthorized: false },
});

//----------------------
mongoose.connect('mongodb://localhost/deneme-db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const app = express();

app.use(express.static(path.join(__dirname, '/../client/build')));
app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/../client/build/index.html'));
});

function getObjKey(obj, value) {
    return Object.keys(obj).find(key => obj[key] === value);
} 

var dict = {
    $gt:">",
    $lt:"<",
    $gte:">=",
    $lte:"<=",
    $eq:"=",
    $ne:"!=",};

const createQueryWithSql = (data)=>{
    let temp = {["$"+data.combinator]:[]};
    for(let item of data.rules){
        if(item.rules){
            const sub = createQueryWithSql(item);
            temp["$"+data.combinator].push(sub);
        }
        else{
            temp["$"+data.combinator].push({[item.field]:{[getObjKey(dict,item.operator)]:item.value}});
        }
    }
    return temp
}

app.post('/api/sales', async (req, res) => {
    const query = req.body;
    const { sql, params } = formatQuery(query, "parameterized");
    const jsonQuery = JSON.parse(formatQuery(query, "json"))
    // const whereClause = processSQL(sql);
    // const selectRawData = `SELECT * FROM sales WHERE ${whereClause} ORDER BY order_id ASC`;
    // console.log(selectRawData);
    // console.log(params);

    let data = [];
    try{
        const temp = createQueryWithSql(jsonQuery)
        console.log(JSON.stringify(temp));
        data = await Deneme.find(temp);
        // data = (await pool.query(selectRawData, params)).rows;
    }catch(error){
        console.log(error);
        res.json({ data: [], chartData: [], error});
        return;
    }

    // const chartSQL = `SELECT date_trunc('month', order_date)::date order_month, SUM(total_revenue) revenue, SUM(total_profit) profit FROM (${selectRawData}) sales_raw GROUP BY date_trunc('month', order_date) ORDER BY 1`;
    let chartData = [];
    // try{
    //     chartData = (await pool.query(chartSQL, params)).rows;
    // }catch(error){
    //     console.log(error);
    //     res.json({ data: [], chartData: [], error});
    //     return;
    // }

    res.json({ data, chartData, error: null });
});

app.post('/api/unlocode', async (req, res) => {
    const query = req.body;
    const { sql, params } = formatQuery(query, "parameterized");
    const whereClause = processSQL(sql);
    const selectRawData = `SELECT * FROM unlocode WHERE ${whereClause} ORDER BY id ASC`;
    console.log(selectRawData);
    console.log(params);

    let data = [];
    try{
        data = (await pool.query(selectRawData, params)).rows;
    }catch(error){
        console.log(error);
        res.json({ data: [], error});
        return;
    }

    res.json({ data, error: null });
});

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});