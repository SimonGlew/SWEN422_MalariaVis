var webdriver = require('selenium-webdriver'),
    assert = require('assert')

// Input capabilities
var capabilities = {
    'browserName': 'Chrome',
    'browser_version': '62.0',
    'os': 'Windows',
    'os_version': '10',
    'resolution': '1920x1080',
    'browserstack.user': 'markharris16',
    'browserstack.key': '1Qxh5CEZexSskYyGuGTc'
}

var driver = new webdriver.Builder().
    usingServer('http://hub-cloud.browserstack.com/wd/hub').
    withCapabilities(capabilities).
    build();

assert.equalTrue = function (condition){
    assert.equal(condition, true)
}

assert.equalFalse = function (condition){
    assert.equal(condition, false)
}

describe('#scenarioOne', async () => {
    it('runs scenario one', async () => {
        await driver.manage().window().maximize();


        await driver.get('http://barretts.ecs.vuw.ac.nz:52724/')
        await driver.findElement(webdriver.By.id('incidence')).click()
        let indonesiaElement = await driver.findElement(webdriver.By.id('feature-IDN'))
        await driver.wait(webdriver.until.elementIsVisible(indonesiaElement),100);
        await driver.actions().move(indonesiaElement).perform();
        let year = (await driver.findElement(webdriver.By.id('yearSliderLabel'))).getText()
        assert.equalTrue(year == '2000')

        let mortalityText = (await driver.findElement(webdriver.By.id('mortalityTooltip'))).getText()
        let incidenceText = (await driver.findElement(webdriver.By.id('incidenceTooltip'))).getText()
        let percentageText = (await driver.findElement(webdriver.By.id('percentageTooltip'))).getText()

        assert.equalTrue(mortalityText == '4.13')
        assert.equalTrue(year == '99')
        assert.equalTrue(year == '0.04')

        await driver.findElement(webdriver.By.id('exportMapBtn')).click()
        await driver.findElement(webdriver.By.id('exportCSVBtn')).click()

        driver.quit();
    }).timeout(0);
})


//BROWSER STACK LOGIN DETAILS

//email: t5.swen422@gmail.com
//password: BQBhWeaK