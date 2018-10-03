var webdriver = require('selenium-webdriver'),
    assert = require('assert')

// Input capabilities
var capabilities = {
    'browserName': 'Chrome',
    'browser_version': '62.0',
    'os': 'Windows',
    'os_version': '10',
    'resolution': '1024x768',
    'browserstack.user': 'markharris16',
    'browserstack.key': '1Qxh5CEZexSskYyGuGTc'
}

var driver = new webdriver.Builder().
    usingServer('http://hub-cloud.browserstack.com/wd/hub').
    withCapabilities(capabilities).
    build();

describe('#firstTest', async () => {
    it('runs a first test', async () => {
        await driver.get('http://www.google.com')
        await driver.findElement(webdriver.By.name('q')).sendKeys('BrowserStack\n')
        let title = await driver.getTitle()
        console.log(title);
        assert.equal(1 == 1, true)
        driver.quit();
    }).timeout(0);
})


//BROWSER STACK LOGIN DETAILS

//email: t5.swen422@gmail.com
//password: BQBhWeaK