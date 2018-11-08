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

const waitFind = (locator) => {
    return driver.findElement(async () => {
        await driver.wait(webdriver.until.elementLocated(webdriver.By.id(locator)));
        return driver.findElement(webdriver.By.id(locator));
    });
}

describe('#scenarioOne', async () => {
    it('runs scenario one', async () => {
        await driver.manage().window().maximize();

        await driver.get('http://barretts.ecs.vuw.ac.nz:52724/')
        await driver.findElement(webdriver.By.id('incidence')).click()
        await waitFind('feature-IDN').click()
        let year = await driver.findElement(webdriver.By.id('yearSliderLabel'))
        let yearText = await year.getText()
        assert.equalTrue(yearText == '2000')

        let mortalityTooltip = await driver.findElement(webdriver.By.id('mortalityTooltip'))
        let mortalityText = await mortalityTooltip.getText()

        let incidenceTooltip = await driver.findElement(webdriver.By.id('incidenceTooltip'))
        let incidenceText = await incidenceTooltip.getText()

        let percentageTooltip = await driver.findElement(webdriver.By.id('percentageTooltip'))
        let percentageText = await incidenceTooltip.getText()


        assert.equalTrue(mortalityText == '4.13')
        assert.equalTrue(incidenceText == '99')
        assert.equalTrue(percentageText == '0.04')

        await driver.findElement(webdriver.By.id('exportMapBtn')).click()
        await driver.findElement(webdriver.By.id('exportCSVBtn')).click()

        driver.quit();
    }).timeout(0);
})


//BROWSER STACK LOGIN DETAILS

//email: t5.swen422@gmail.com
//password: BQBhWeaK