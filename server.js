const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const pretty = require("pretty");
const fs = require('fs')

const selectors = {
    search: '#twotabsearchtextbox',
    nextButton: 'class="a-last"',
    results: '#s-results-list-atf',
    productLinks: `//span[@class="a-size-base-plus a-color-base a-text-normal"]`,
    itemPrice: 'class="a-price-whole"'
};


const url = 'https://www.amazon.ca';
//var item = require('./server.js');


const express = require('express');
const app = express();
var bodyParser = require('body-parser');

var item = "";

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    
    res.render("main", {items: items, prices: prices, links: links});
});

app.post('/search',(req, res) => {
    item = req.body.item;
    startTracking();
    res.render("main", {items: items, prices: prices, links: links});
    //res.redirect('/');
    res.end();
    
});

app.listen(3000);


var items = [];
var prices = [];
var links = [];


async function configureBrowser() {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.goto(url);
    await page.type(selectors.search, item)
    await page.keyboard.press('Enter');
    return page;
} 



async function checkPrice(page) {
    await page.reload();
    let html = await page.evaluate(() => document.body.innerHTML);
    let $ = await cheerio.load(html);

    $("span[class='a-size-base-plus a-color-base a-text-normal']").each((_, e) => {

        let row  = $(e).text().replace(/(\s+)/g, ' ');
        items.push(row.toString());
        //console.log(`${row}`);
    });

    $("span[class='a-price-whole']").each((_, e) => {

        let row  = $(e).text().replace(/(\s+)/g, ' ');
        prices.push(row);
        //console.log(`${row}`);
    });

    $("a[class='a-link-normal s-underline-text s-underline-link-text s-link-style a-text-normal']").each((_, e) => {

        let row  = $(e).attr();
        links.push(url + row.href);
        //console.log(`${row}`);
    });

    //console.log(items)
    //console.log(prices)
    //console.log(links)

    var file = fs.createWriteStream('array.txt');
    items.forEach((item, index) => {
        file.write(item + "\t" + prices[index] + "\t" + links[index] + "\n");
    });
    file.end();

}

async function startTracking() {
    const page = await configureBrowser();

    await checkPrice(page);
}


//startTracking();