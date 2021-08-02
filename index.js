// Modules
const http = require('http');
const fs = require('fs').promises;
const url = require('url');
const bicycles = require('./data/data.json');

// Server
const server = http.createServer(async (req, res) => {
    //    Persing URL
    if (req.url === "/favicon.ico") return;

    const myUrl = new URL(req.url, `http://${req.headers.host}`);
    const id = myUrl.searchParams.get('id');
    const pathName = myUrl.pathname;




    // Routes
    // Home Page
    if (pathName === '/') {
        let html = await fs.readFile('./views/bicycles.html', 'utf-8');
        let bicycle = await fs.readFile('./public/partials/bicycle.html', 'utf-8');
        let allTheBicycles = '';

        for (index = 0; index < bicycles.length; index++) {
            allTheBicycles += replaceTemplate(bicycle, bicycles[index]);
        }
        html = html.replace(/<%AllTheBicycles%>/g, allTheBicycles);

        res.writeHead(200, {
            'Content-Type': 'text/html'
        });
        res.end(html);

        // Overview Page
    } else if (pathName === '/bicycle' && id >= 0 && id <= 5) {
        let html = await fs.readFile('./views/overview.html', 'utf-8');
        let bicycle = bicycles.find((b) => b.id === id);

        html = replaceTemplate(html, bicycle);

        res.writeHead(200, {
            'Content-Type': 'text/html'
        });
        res.end(html);

        //  Image
    } else if (/\.(png)$/i.test(req.url)) {
        const image = await fs.readFile(`./public/images/${req.url.slice(1)}`);
        res.writeHead(200, {
            'Content-Type': 'image/png'
        });
        res.end(image);
        /<%AllTheBicycles%>/g
        // CSS
    } else if (/\.(css)$/i.test(req.url)) {
        const css = await fs.readFile('./public/css/index.css', 'utf-8');
        res.writeHead(200, {
            'Content-Type': 'text/css'
        });
        res.end(css);

        // SVG
    } else if (/\.(svg)$/i.test(req.url)) {
        const svg = await fs.readFile('./public/images/icons.svg')
        res.writeHead(200, {
            'Content-Type': 'image/svg+xml'
        });
        res.end(svg);
    }

    // Error
    else {
        res.writeHead(404, {
            'Content-Type': 'text/html'
        });
        res.end('<h1>Invalid</h1>');
    }
})


// Replace Templates
function replaceTemplate(html, bicycle) {
    let price = bicycle.originalPrice;
    if (bicycle.hasDiscount) {
        price = (price * (100 - bicycle.discount)) / 100;
    }
    html = html.replace(/<%IMAGE%>/g, bicycle.image);
    html = html.replace(/<%NAME%>/g, bicycle.name);
    html = html.replace(/<%NEWPRICE%>/g, `$${price}.00`);
    html = html.replace(/<%ID%>/g, bicycle.id);
    html = html.replace(/<%OLDPRICE%>/g, `$${bicycle.originalPrice}.00`);

    for (let index = 0; index < bicycle.star; index++) {
        html = html.replace(/<%STAR%>/, 'checked');
    }
    html = html.replace(/<%STAR%>/g, '');


    if (bicycle.hasDiscount) {
        html = html.replace(/<%DISCOUNTPRICE%>/, `<div class="discount__rate"><p>${bicycle.discount}% Off</p></div>`);
    } else {
        html = html.replace(/<%DISCOUNTPRICE%>/, "");
    }
    return html;
}





server.listen(3000);