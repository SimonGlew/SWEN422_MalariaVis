var webdriver = require('selenium-webdriver'),
    assert = require('assert')

// Input capabilities
var capabilities = {
    'browserName': 'Chrome',
    'browser_version': '62.0',
    'os': 'Windows',
    'os_version': '10',
    'resolution': '1920x1080',
    'browserstack.user': 'mark1755',
    'browserstack.key': '23Be9rwGvsGSNhbaZbND'
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

            let elem = await waitFind('feature-COD')

            await driver.findElement(webdriver.By.id('submit')).click()
            await driver.sleep(2000)

            elem = await waitFind('feature-COD')
            let t2 = parseScale(await elem.getAttribute('transform'));


            assert.equalTrue(t2.scale > 1);
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
      await actions.dragAndDrop(elem,{x:50, y:0}).perform();

      elem = await waitFind('feature-IRN')
      let t2 = parseTranslation(await elem.getAttribute('transform'));

      assert.equalTrue(t1.x != t2.x);



    }).timeout(0);
  })

  describe('#countryClickTestOne', async () =>{
    it('Check that map click works', async () =>{
      const actions = driver.actions({ bridge: true });

      await driver.manage().window().maximize();
      await driver.get('http://barretts.ecs.vuw.ac.nz:52724/')

      let iran = await waitFind('feature-IRN') //check map loaded first

      await driver.findElement(webdriver.By.id('feature-IRN')).click();
      await driver.sleep(2000)

      let stroke = await iran.getAttribute('stroke');
      console.log("stroke after click", stroke);

      let legendVal = await waitFind('legendtext-IRN');
      console.log("legendval", legendVal);
      assert.equalTrue(stroke == "#00F");


    }).timeout(0);
  })

  describe('#undoTest', async () =>{
    it('Check that undo works', async () =>{
      await driver.manage().window().maximize();

      await driver.get('http://barretts.ecs.vuw.ac.nz:52724/')

      let elem = await waitFind('feature-COD')

      await driver.findElement(webdriver.By.id('submit')).click()
      await driver.sleep(2000)

      elem = await waitFind('feature-COD')
      let t2 = parseScale(await elem.getAttribute('transform'));


      assert.equalTrue(t2.scale > 1);

      await driver.findElement(webdriver.By.id('undo')).click()
      await driver.sleep(2000)
      elem = await waitFind('feature-COD')
      let t3 = parseScale(await elem.getAttribute('transform'));
      assert.equalTrue(t2.scale > t3.scale);

    }).timeout(0);
  })

  describe('#redoTest', async () =>{
    it('Check that filtering and submit works', async () =>{
      await driver.manage().window().maximize();

      await driver.get('http://barretts.ecs.vuw.ac.nz:52724/')

      let elem = await waitFind('feature-COD')

      await driver.findElement(webdriver.By.id('submit')).click()
      await driver.sleep(2000)

      elem = await waitFind('feature-COD')
      let t2 = parseScale(await elem.getAttribute('transform'));


      assert.equalTrue(t2.scale > 1);

      await driver.findElement(webdriver.By.id('undo')).click()
      await driver.sleep(2000)
      elem = await waitFind('feature-COD')
      let t3 = parseScale(await elem.getAttribute('transform'));
      assert.equalTrue(t2.scale > t3.scale);

      await driver.findElement(webdriver.By.id('redo')).click()
      await driver.sleep(2000)
      elem = await waitFind('feature-COD')
      let t4 = parseScale(await elem.getAttribute('transform'));
      assert.equalTrue(t4.scale > t3.scale);

    }).timeout(0);
  })

  describe('#testFilterSliders', async () =>{
    it('Check that filtering and submit works', async () =>{
      await driver.manage().window().maximize();

      await driver.get('http://barretts.ecs.vuw.ac.nz:52724/')
      await driver.sleep(2000)

      let mortalitySlider = await waitFind('mortality-slider');
      let mortalityLower = await waitFind('mortality-lower-handle');
      let mortalityUpper = await waitFind('mortality-upper-handle');
      console.log('mortalitySlider', mortalitySlider, mortalityLower, mortalityUpper);


      let incidenceSlider = await waitFind('incidence-slider');
      let incidenceLower = await waitFind('incidence-lower-handle');
      let incidenceUpper = await waitFind('incidence-upper-handle');
      console.log('incidenceslider', incidenceSlider, incidenceLower, incidenceUpper);


      let deathPercentageSlider = await waitFind('deathPercentage-slider');
      let deathPercentageLower = await waitFind('deathPercentage-lower-handle');
      let deathPercentageUpper = await waitFind('deathPercentage-upper-handle');
      console.log('deathslider', deathPercentageSlider, deathPercentageLower, deathPercentageUpper);

      //drag each one, check it is now greater than 0
      await actions.dragAndDrop(mortalityLower,{x:200, y:0}).perform();
      await actions.dragAndDrop(incidenceLower,{x:200, y:0}).perform();
      await actions.dragAndDrop(deathPercentageLower,{x:200, y:0}).perform();

      assert.equalTrue(parseFloat(mortalityLower.innerText) > 0);
      assert.equalTrue(parseFloat(incidenceLower.innerText) > 0);
      assert.equalTrue(parseFloat(deathPercentageLower.innerText) > 0);

      await actions.dragAndDrop(mortalityUpper,{x:-200, y:0}).perform();
      await actions.dragAndDrop(incidenceUpper,{x:-200, y:0}).perform();
      await actions.dragAndDrop(deathPercentageUpper,{x:-200, y:0}).perform();

      assert.equalTrue(parseFloat(mortalityUpper.innerText) < 250);
      assert.equalTrue(parseFloat(incidenceUpper.innerText) < 1000);
      assert.equalTrue(parseFloat(deathPercentageUpper.innerText) < 0.7);


      // await driver.findElement(webdriver.By.id('submit')).click()
      // await driver.sleep(2000)
      //
      // elem = await waitFind('feature-COD')
      // let t2 = parseScale(await elem.getAttribute('transform'));
      //
      //
      // assert.equalTrue(t2.scale > 1);
      //
      // await driver.findElement(webdriver.By.id('undo')).click()
      // await driver.sleep(2000)
      // elem = await waitFind('feature-COD')
      // let t3 = parseScale(await elem.getAttribute('transform'));
      // assert.equalTrue(t2.scale > t3.scale);
      //
      // await driver.findElement(webdriver.By.id('redo')).click()
      // await driver.sleep(2000)
      // elem = await waitFind('feature-COD')
      // let t4 = parseScale(await elem.getAttribute('transform'));
      // assert.equalTrue(t4.scale > t3.scale);

    }).timeout(0);
  })

  describe('#testExport', async () =>{
    it('Check that filtering and submit works', async () =>{

    }).timeout(0);
  })
})



//BROWSER STACK LOGIN DETAILS

//email: t5a.swen422@gmail.com
//password: BQBhWeaK
