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

assert.equalTrue = function (condition) {
    assert.equal(condition, true)
}

assert.equalFalse = function (condition) {
    assert.equal(condition, false)
}

const waitFind = (locator) => {
    return driver.findElement(async () => {
        await driver.wait(webdriver.until.elementLocated(webdriver.By.id(locator)));
        return driver.findElement(webdriver.By.id(locator));
    });
}

const parseTranslation = (transform) =>{
  console.log('transform', transform)
  let s = transform.substring(transform.indexOf('(')+1, transform.indexOf(')'));
  console.log('s', s);
  let split = s.split(',');
  console.log('split', split);
  return {x:parseFloat(split[0]), y:parseFloat(split[1])};

}
const parseScale = (transform) =>{
  console.log('transform', transform)
  let s = transform.substring(transform.indexOf('scale(')+6, transform.lastIndexOf(')'));

  return {scale:parseFloat(s)};


}

describe('hooks', async () => {
    after(async function() {
        this.timeout(0)
        await driver.quit()
    })

    describe('#TolTipCheck', async () => {
        it('check tooltip on Iran with year 2000 and download map and csv', async () => {
            const actions = driver.actions({ bridge: true });

            await driver.manage().window().maximize();

            await driver.get('http://barretts.ecs.vuw.ac.nz:52724/')
            await driver.findElement(webdriver.By.id('incidence')).click()

            let year = await waitFind('yearSliderLabel')
            let yearText = await year.getText()
            assert.equalTrue(yearText == '2000')

            let elem = await waitFind('feature-IRN')
            let elemHeight = await elem.getAttribute('height')
            let elemWidth = await elem.getAttribute('width')

            await actions.move({ duration: 1000, origin: elem, x: (elemWidth / 2), y: (elemHeight / 2) }).perform();

            await waitFind('mortalityTooltip')
            let mortalityTooltip = await driver.findElement(webdriver.By.id('mortalityTooltip'))
            let mortalityText = await mortalityTooltip.getText()

            let incidenceTooltip = await driver.findElement(webdriver.By.id('incidenceTooltip'))
            let incidenceText = await incidenceTooltip.getText()

            let percentageTooltip = await driver.findElement(webdriver.By.id('percentageTooltip'))
            let percentageText = await percentageTooltip.getText()

            assert.equalTrue(mortalityText == '0.02')
            assert.equalTrue(incidenceText == '39.9')
            assert.equalTrue(percentageText == '0.00')

            await driver.findElement(webdriver.By.id('exportMapBtn')).click()
            await driver.findElement(webdriver.By.id('exportCSVBtn')).click()
        }).timeout(0);
    })

    describe('#yearSliderCheck', async () => {
        it('Check that year slider animation works', async () => {
            await driver.manage().window().maximize();

            await driver.get('http://barretts.ecs.vuw.ac.nz:52724/')
            let year = await waitFind('yearSliderLabel')
            let yearText = await year.getText()

            assert.equalTrue(yearText == '2000')

            await driver.findElement(webdriver.By.id('playBtn')).click()
            await driver.sleep(5000)
            year = await waitFind('yearSliderLabel')
            yearText = await year.getText()

            assert.equalTrue(yearText == '2015')
        }).timeout(0);
    })

    describe('#mapZoomingWorks', async () => {
        it('Check that year slider animation works', async () => {
            await driver.manage().window().maximize();

            await driver.get('http://barretts.ecs.vuw.ac.nz:52724/')
            await driver.sleep(2000)
            console.log('afew')

            let elem = await waitFind('feature-COD')
            console.log(elem);
            let t1 = parseScale(await elem.getAttribute('transform'));

            await driver.findElement(webdriver.By.id('submit')).click()
            await driver.sleep(2000)

            elem = await waitFind('feature-COD')
            let t2 = parseScale(await elem.getAttribute('transform'));

            console.log('t1',t1);
            console.log('t2',t2);

            assert.equalTrue(t2 > t1);
        }).timeout(0);
  })
  describe('#mapDraggingTestOne', async () =>{
    it('Check that dragging works', async () =>{
      const actions = driver.actions({ bridge: true });

      await driver.manage().window().maximize();
      await driver.get('http://barretts.ecs.vuw.ac.nz:52724/')

      await waitFind('feature-IRN') //check map loaded first

      await driver.findElement(webdriver.By.id('submit')).click()
      await driver.sleep(2000)

      let elem = await waitFind('feature-IRN')
      let t1 = parseTranslation(await elem.getAttribute('transform'));
      console.log('t1',t1);
      await actions.dragAndDrop(elem,{x:50, y:0}).perform();

      elem = await waitFind('feature-IRN')
      let t2 = parseTranslation(await elem.getAttribute('transform'));

      console.log('t2', t2);
      assert.equalTrue(t1.x != t2.x);



    }).timeout(0);
  })
})



//BROWSER STACK LOGIN DETAILS

//email: t5.swen422@gmail.com
//password: BQBhWeaK
