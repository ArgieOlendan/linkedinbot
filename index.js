const linkedin = require('./linkedin');
require('dotenv').config({ path: __dirname + '/.env' });

let companyName = 'assistRx';
let employeeType = 'ceo';

(async () => {
    await linkedin.initialize();
    
    await linkedin.login(process.env['USER_NAME'], process.env['PASSWORD']);

    await linkedin.search(companyName);

    await linkedin.getEmployees(employeeType);

    await linkedin.convertToCSV();

    await linkedin.closeBrowser();
})();