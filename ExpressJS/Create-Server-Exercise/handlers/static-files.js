const URL = require("url");
const PATH = require("path");
const FS = require("fs");


function getContentType(path) {
    if (path.endsWith(".css"))
        return 'text/css';

    if (path.endsWith(".ico"))
        return 'image/x-icon';

    if (path.endsWith(".jpg") || path.endsWith(".jpeg"))
        return 'image/jpeg';

    if (path.endsWith('.html')) {
        return 'text/html';
    }

    if (path.endsWith('.js')) {
        return 'application/javascript';
    }

    return 'text/plain';

}

module.exports = (req, res) => {

    if (req.path.startsWith("/content/") && req.method === "GET") {
        let filePath = PATH.normalize(
            PATH.join(__dirname, `..${req.path}`));

        FS.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead("404", {
                    'content-type': 'text/plain'
                });

                res.writeHead("File not found");
                res.end();
                return
            }

            res.writeHead(200, {
                'content-type': getContentType(req.path)
            });

            res.write(data);
            res.end();
        })
    } else
        return true;
};