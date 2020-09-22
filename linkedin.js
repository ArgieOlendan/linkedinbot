const puppeteer = require('puppeteer');
const json2xls = require('json2xls');
const fs = require('fs-writefile-promise');

const BASE_URL = 'https://www.linkedin.com/';

const linkedin = {
	browser: null,
	page: null,
	employees: null,

	initialize: async () => {
		linkedin.browser = await puppeteer.launch({
			headless: true
		});

		linkedin.page = await linkedin.browser.newPage();
	},

	login: async (userName, password) => {
		await linkedin.page.goto(BASE_URL, { waintUntil: 'networkidle2' });

		await linkedin.page.type('input[name="session_key"]', userName);
		await linkedin.page.type('input[name="session_password"]', password);

		let loginButton = await linkedin.page.$x('//button[contains(text(), "Sign in")]');

		await loginButton[0].click();

		await linkedin.page.waitForNavigation({ waintUntil: 'networkidle2' });

		console.log('loged in!🎉');
	},

	search: async (companyName) => {
		if (!companyName) { return process.exit(0) }

		await linkedin.page.type('input[aria-label="Search"]', companyName);
		await linkedin.page.type('input[aria-label="Search"]', String.fromCharCode(13));

		await linkedin.page.waitForSelector('h3.search-results__total');

		await linkedin.page.click('div[data-test-search-result="COMPANY"] a');
		await linkedin.page.waitForNavigation({ waintUntil: 'networkidle2' });

	},

	getEmployees: async (employeeType) => {
		if (!employeeType) { return process.exit(0) }

		let peopleNav = await linkedin.page.$x('//a[contains(., "People")]');

		peopleNav[0].click();

		await linkedin.page.waitForSelector('span[class="t-20 t-black"]');
		await linkedin.page.waitFor(5000);

		await linkedin.page.type('#people-search-keywords', employeeType)
		await linkedin.page.type('#people-search-keywords', String.fromCharCode(13));

		await linkedin.page.waitForSelector('section[class="artdeco-card artdeco-card--with-hover ember-view"]');

		await linkedin.page.evaluate(() => {
			let employees = []

			Array.from(document.querySelectorAll('ul.org-people-profiles-module__profile-list li'), el => {
				employees.push({
					name: el.querySelector('div[class="artdeco-entity-lockup__title ember-view"]').innerText.trim(),
					possition: el.querySelector('div[class="artdeco-entity-lockup__subtitle ember-view"]').innerText.trim(),
				});
			})

			return employees;

		})
			.then((employees) => {
				console.log(employees);
				linkedin.employees = employees;
			})
			.catch((e) => { console.error(e) });

	},

	closeBrowser: async () => {
		await linkedin.browser.close();
	},

	convertToCSV: async () => {
		let data = json2xls(linkedin.employees);
		let createId = (length) => {
			var result = '';
			var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
			var charactersLength = characters.length;
			for (var i = 0; i < length; i++) {
				result += characters.charAt(Math.floor(Math.random() * charactersLength));
			}
			return result;
		};
		let fileName = createId(5) + '.xlsx';

		fs('../linkedinbot/csvfiles/' + fileName, data, 'binary')
			.then(() => {
				console.log('Saved as: ' + fileName + " 💥");
			})
			.catch((e) => { console.error(e); });
	}

}

module.exports = linkedin;