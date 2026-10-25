const fs = require('fs');
const path = require('path');
const assert = require('assert');
const puppeteer = require('puppeteer-core');

const repo = path.resolve(__dirname, '..');
const { build } = require(path.join(repo, 'skill/maimai-big-artist/scripts/build.cjs'));
const input = path.join(repo, 'examples/fictional-orders.json');
const outputDir = path.join(repo, 'output');
const html = path.join(outputDir, 'smoke-test.html');

(async () => {
  let browser;
  try {
    fs.mkdirSync(outputDir, { recursive: true });
    if (fs.existsSync(html)) fs.unlinkSync(html);
    build(input, html);

    browser = await puppeteer.launch({
      executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
      headless: true
    });
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`file:///${html.replace(/\\/g, '/')}`);
    await page.evaluate(() => document.fonts.ready);

    const initial = await page.evaluate(() => ({
      title: document.title,
      orders: realOrders.length,
      scope: realScope,
      combo: {
        name: labById.demo_classic_combo.name,
        directQuantity: totalCount('demo_classic_combo'),
        components: componentRows(labById.demo_classic_combo).length
      },
      burgerPattyQuota: labById.demo_double_beef_burger.recipe[2].count * totalCount('demo_double_beef_burger'),
      colaCupQuota: labById.demo_medium_cola.recipe[1].count * totalCount('demo_medium_cola'),
      privateMarkersAbsent: !document.documentElement.innerHTML.includes('天府三街')
    }));
    assert.equal(initial.title.startsWith('麦麦大艺术家'), true);
    assert.equal(initial.orders, 2);
    assert.equal(initial.scope, 'demo_order_classic_combo');
    assert.equal(initial.combo.name, '人气经典随心配');
    assert.equal(initial.combo.directQuantity, 0);
    assert.equal(initial.combo.components, 7);
    assert.equal(initial.burgerPattyQuota, 2);
    assert.equal(initial.colaCupQuota, 1);
    assert.equal(initial.privateMarkersAbsent, true);

    const pattyRow = 2;
    await page.click(`[data-add="${pattyRow}"]`);
    assert.equal(await page.evaluate(index => used(index), pattyRow), 1);

    await page.click('#saveReference');
    await page.type('#referenceName', '套餐底稿');
    await page.waitForFunction(() => document.querySelector('#inspirationModal').classList.contains('open') && !document.querySelector('#referenceSaveSubmit').disabled);
    await page.$eval('#referenceSaveSubmit', button => button.click());
    await page.waitForFunction(() => !saveBusy && personalReferences.length === 1);
    const original = await page.evaluate(() => JSON.stringify(personalReferences[0]));
    await page.click('#inspirationClose');
    await page.click('[data-real-scope="demo_order_february_wings"]');
    assert.equal(await page.evaluate(() => canvas.querySelectorAll('.placed').length), 0);
    const february = await page.evaluate(() => ({
      comboDirectQuantity: totalCount('demo_wings_combo'),
      honeyQuota: labById.demo_honey_v_wing.recipe[0].count * totalCount('demo_honey_v_wing'),
      spicyQuota: labById.demo_spicy_wings.recipe[0].count * totalCount('demo_spicy_wings'),
      coffeeComponents: componentRows(labById.demo_brewed_coffee).length,
      customization: labById.demo_brewed_coffee.customization
    }));
    assert.equal(february.comboDirectQuantity, 0);
    assert.equal(february.honeyQuota, 1);
    assert.equal(february.spicyQuota, 2);
    assert.equal(february.coffeeComponents, 2);
    assert.equal(february.customization, '奶油球不要 / 白砂糖不要');
    await page.click('#inspiration');
    await page.click('[data-personal-load="0"]');
    const continuation = await page.evaluate(() => ({
      scope: realScope,
      pieces: canvas.querySelectorAll('.placed').length,
      honeyQuota: quota(0),
      sourceScopes: serializeScene().sourceScopes
    }));
    assert.equal(continuation.scope, 'demo_order_february_wings');
    assert.equal(continuation.pieces, 1);
    assert.equal(continuation.honeyQuota, 1);
    assert.deepEqual(new Set(continuation.sourceScopes), new Set(['demo_order_february_wings', 'demo_order_classic_combo']));
    await page.click('[data-add="0"]');
    await page.click('#saveReference');
    await page.type('#referenceName', '二月鸡翅续作');
    await page.waitForFunction(() => document.querySelector('#inspirationModal').classList.contains('open') && !document.querySelector('#referenceSaveSubmit').disabled);
    await page.$eval('#referenceSaveSubmit', button => button.click());
    await page.waitForFunction(() => !saveBusy && personalReferences.length === 2);
    assert.equal(await page.evaluate(() => JSON.stringify(personalReferences[1])), original);
    assert.equal(await page.evaluate(() => personalReferences[0].scene.pieces.length), 2);
    assert.equal(await page.evaluate(() => personalReferences[0].parentId === personalReferences[1].id), true);
    await page.click('#inspirationClose');
    await page.reload();
    await page.click('#inspiration');
    assert.equal(await page.$$eval('[data-personal-load]', buttons => buttons.length), 2);
    await page.click('[data-personal-load="0"]');
    assert.equal(await page.evaluate(() => canvas.querySelectorAll('.placed').length), 2);
    assert.equal(await page.evaluate(() => realScope), 'demo_order_classic_combo');

    for (const width of [390, 760, 1024, 1440]) {
      await page.setViewport({ width, height: 900 });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
      assert.equal(overflow, false, `${width}px should not overflow horizontally`);
    }

    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ passed: true, initial, continuation, errors }, null, 2));
  } finally {
    if (browser) await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
