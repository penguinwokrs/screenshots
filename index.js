const puppeteer = require('puppeteer');
const iPhone = puppeteer.devices['iPhone 6'];
const fs = require('fs');
const obj = JSON.parse(fs.readFileSync('./list.json', 'utf8'));

(async () => {
    for (let i = 0; i < obj.data.length; i++) {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        // デバイス（仮想）の設定
        await page.emulate(iPhone);
        // ナンバリング
        let order = 1;
        const id = obj.data[i]
        const id_name = id.toString().padStart(3, '0');
        await page.goto(`https://mall.finc.com/products/${id}`);
        await page.screenshot({path: `./screenshots/product_${id_name}.png`, fullPage: true});


        // カラーの場合
        const colorButtonDivs = await page.$$('input[name="color_selector"]');
        // セレクターの場合
        const selectorButtonDivs = await page.$$('.fmr-bar-select > li > select > option');


        if (null !== selectorButtonDivs && null !== colorButtonDivs) {

            try {
                // カラー選択
                for (let colorNum = 0; colorNum < colorButtonDivs.length; colorNum++) {
                    await colorButtonDivs[colorNum].click();
                    await page.waitForSelector('input[checked]', {timeout: 3000});

                    // selector 選択
                    for (let selectNum = 0; selectNum < selectorButtonDivs.length; selectNum++) {
                        const context = await selectorButtonDivs[selectNum].getProperty('value');
                        const contextValue = await await context.jsonValue();
                        await page.select('.fmr-bar-select > li > select', `${contextValue}`);
                        await page.waitForSelector('.fmr-bar-select > li > select > option[selected]', {timeout: 3000});
                        // 選択終えたらスクショ
                        await page.screenshot({
                            path: `./screenshots/product_${id_name}_${order++}.png`,
                            fullPage: true
                        });
                    }
                }
            } catch (e) {
                await page.screenshot({path: `./screenshots/product_${id_name}_${order++}.png`, fullPage: true});
            }
        } else {

            if (null !== selectorButtonDivs) {
                for (let i = 0; i < selectorButtonDivs.length; i++) {
                    const context = await selectorButtonDivs[i].getProperty('value');
                    const contextValue = await await context.jsonValue();
                    await page.select('.fmr-bar-select > li > select', `${contextValue}`);
                    await page.waitForSelector('.fmr-bar-select > li > select > option[selected]', {timeout: 3000});
                    await page.screenshot({path: `./screenshots/product_${id_name}_${order++}.png`, fullPage: true});
                }
            }
            // カラーバリエーションの場合
            if (null !== colorButtonDivs) {
                for (let i = 0; i < colorButtonDivs.length; i++) {
                    await colorButtonDivs[i].click();
                    await page.waitForSelector('input[checked]', {timeout: 3000});
                    await page.screenshot({path: `./screenshots/product_${id_name}_${order++}.png`, fullPage: true});
                }
            }
        }

        await browser.close();
    }


})();

