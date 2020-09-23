const linkedin = require('./linkedin');
const vpTest = require('./vp-test01');
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan')
require('dotenv').config({ path: __dirname + '/.env' });

let companyName = 'assistRx';
let employeeType = 'ceo';

(async () => {
    const app = express();
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(morgan('tiny'));

    // await linkedin.initialize();
    
    // await linkedin.login(process.env['USER_NAME'], process.env['PASSWORD']);

    // await linkedin.search(companyName);

    // await linkedin.getEmployees(employeeType);

    // await linkedin.convertToCSV();

    // await linkedin.closeBrowser();

    app.post('/vpserver', async (req, res) => {
        await vpTest.initialize();
        await vpTest.crawlPage(req.body);
    });

    const PORT = 3000;

    app.listen(PORT, () => {
        console.log(`Listening on port ${PORT}`);
    });

})();