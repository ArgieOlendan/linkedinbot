const puppeteer = require('puppeteer');
const { gender } = require('./user');

const BASE_URL = 'http://qualva.com.s3.amazonaws.com/vp_dummy/subsc/vp-test01.html';

const vp = {
	browser: null,
	page: null,
	user: null,

	initialize: async () => {
		vp.browser = await puppeteer.launch({ headless: false });
		vp.page = await vp.browser.newPage();

		await vp.page.goto(BASE_URL, { waintUntil: 'networkIdle2' });
		await vp.page.waitForSelector('#ukokkei-landing-page-form');

		console.log('Connected to vp server! 🎊🎊')
	},

	crawlPage: async (user) => {
		if (user.isMember) {
			await vp.page.click('div[class="ibox-title ibox-title-no-border"] input[type="checkbox"]', { clickCount: 1 });

			await vp.page.waitForSelector('div[class="ibox-content "]');

			await vp.page.type('div[class="ibox-content "] div[class="uk-domain-suggestable-email-field-wrapper"] input', 'example@email.com');
			await vp.page.type('div[class="ibox-content "] div[class="uk-password-field-wrapper"] input', 'password1!');

			await vp.page.$x('//button[contains(text(), "ログインする")]')
				.then((signInButton) => {
					signInButton[0].click();
				})
				.catch((e) => {
					console.error(e);
				});

		} else {
			//FullName
			await vp.page.type('#jsUkProfileFamilyName', user.name);
			await vp.page.type('#jsUkProfileFirstName', user.lastName);

			//Address
			await vp.page.type('#jsUkProfileZipCode', user.zipCode);
			await vp.page.select('#jsUkProfileStateId', user.stateId);
			await vp.page.type('#jsUkProfileCity', user.city);
			await vp.page.type('#jsUkProfileStreetAddress', user.streetAddress);
			await vp.page.type('#jsUkProfileBuildingName', user.buildingName);

			//Email Address
			await vp.page.type('#jsUkEmail', user.email);

			//Phone Number
			await vp.page.type('#jsUkProfileTel', user.phoneNumber);

			//E-mail newsletter registration
			if (!user.registerToNewsLetter) {
				await vp.page.click('#jsUkIsCampaignAccepted', { clickCount: 1 });
			}

			//Frigana
			await vp.page.type('#jsUkProfileFamilyNameKana', user.lastNameKana);
			await vp.page.type('#jsUkProfileFirstNameKana', user.nameKana);

			//Gender
			await vp.page.waitForSelector('label.customer-info-gender-input-wrapper');
			let genderField = await vp.page.$$('input[name="genderShopId"]');
			user.gender ? genderField[0].click() : gender[1].click();

			//Birthday
			await vp.page.select('#jsUkBirthYear', user.birthDate.year);
			await vp.page.select('#jsUkBirthMonth', user.birthDate.month);
			await vp.page.select('#jsUkBirthDay', user.birthDate.day);

			//First delivery date setting
			await vp.page.select('#jsUkPreferredDeliveryTimeZoneId', user.timeZoneId);

			//Delivery frequency setting (regular / distribution course)
			await vp.page.select('div[class="ibox shipment-frequency-ibox .ibox-title-no-border"] select', user.monthlyInterval);

			//Payment Method
			let paymentMethodField = await vp.page.$$('input[name="payment_method_shop[payment_method_id]"]');

			switch (user.paymentMethod) {
				case 'Rakuten Pay':
					paymentMethodField[0].click();
					break;
				case 'Deferred payment':
					paymentMethodField[1].click();
					break;
				case 'Cash on delivery':
					paymentMethodField[2].click();
					break;
			}

			//Communication column
			await vp.page.$x('//div[contains(text(), "通信")]')
				.then((elem) => {
					elem[0].click();
				})
				.catch((e) => { console.error(e) });

			//Accept Agreement
			await vp.page.evaluate(() => {
				document.querySelector("#jsUkAgreePrivacyPolicy").parentElement.click();
			});

			await vp.page.click('#jsUkSubmitBtn');

			await vp.page.waitForNavigation({ waintUntil: 'networkidle2' });

			await vp.page.$$('img[class="rakuten-confirm-button-image"]')
				.then((el) => {
					el[0].click();
				})
				.catch((e) => {
					console.error(e);
				})
		}
	}

}

module.exports = vp;