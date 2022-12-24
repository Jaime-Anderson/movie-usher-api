//creating variables called http, fs, and url to access import required from module named 'http', 'fs' and 'url'.
const http = require('http'),
      fs = require('fs'),
      url = require('url');
//using new http variable to access the http module 
//createServer function, containing 2 arguments, calls upon the http variable and is called every time an HTTP request is made against the server
http.createServer((request, response) => {

    let addr = request.url;
    q = url.parse(addr, true),
    filePath = '';

    fs.appendFile('log.txt', 'URL: ' + addr + '\nTimestamp: ' + new Date() + '\n\n',
     (err) => {
        if (err) {
            console.log(err);
        }else{
            console.log('Added to log.')
        }
     });

    if (q.pathname.includes('documentation')) {
        filePath = ('documentation.html');
    } else {
        filePath = 'index.html';
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            throw err;
        }

    //below code tells server to add a header to the response sent back along with HTTP code "200"
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.write(data);
    //below code ends the response and sends back a message
    response.end('');

    });
//below sets the server to listen for requests on port 8080 (standard port for HTTP)
}).listen(8080);

console.log('My test server is running on Port 8080');