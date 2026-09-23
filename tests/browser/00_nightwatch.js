/**
 * Tests to ensure that the app loads correctly in a reasonable time and that operations can be run.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

const utils = require("./browserUtils.js");

module.exports = {
    before: browser => {
        browser
            .resizeWindow(1280, 800)
            .url(browser.launchUrl);
    },

    "Loading screen": browser => {
        // Check that the loading screen appears and then disappears within a reasonable time
        browser
            .waitForElementVisible("#preloader", 300)
            .waitForElementNotPresent("#preloader", 10000);
    },

    "App loaded": browser => {
        browser.useCss();
        // Check that various important elements are loaded
        browser.expect.element("#operations").to.be.present;
        browser.expect.element("#operations").to.not.be.visible;
        browser.expect.element(".banner-actions").to.not.be.visible;
        browser.expect.element("#add-operation").to.be.visible;
        browser.expect.element("#recipe").to.be.visible;
        browser.expect.element("#input").to.be.present;
        browser.expect.element("#output").to.be.present;
        browser.expect.element(".op-list").to.be.present;
        browser.expect.element("#rec-list").to.be.present;
        browser.expect.element("#controls").to.be.visible;
        browser.expect.element("#input-text").to.be.visible;
        browser.expect.element("#output-text").to.be.visible;
    },

    "Theme is always dark": browser => {
        browser
            .useCss()
            .expect.element("html").to.have.attribute("class").which.contains("dark");
        browser.expect.element("#theme").to.have.value.that.equals("dark");
    },

    "Operation picker opens with Ctrl+K": browser => {
        browser.perform(function() {
            return this.actions({async: true})
                .keyDown(browser.Keys.CONTROL)
                .keyDown("k")
                .keyUp("k")
                .keyUp(browser.Keys.CONTROL);
        });

        browser
            .useCss()
            .waitForElementVisible("#operations", 1000)
            .execute(() => document.activeElement.id, [], function({value}) {
                browser.expect(value).to.equal("search");
            });

        browser.click("#close-operation-picker-icon");
    },

    "Operations loaded": browser => {
        browser
            .useCss()
            .click("#clr-recipe")
            .click("#add-operation")
            .waitForElementVisible("#operations", 1000)
            .useXpath();
        // Check that the complete operation catalogue is available in the picker
        browser.expect.element("//li[contains(@class, 'operation') and text()='To Base64']").to.be.present;
        browser.expect.element("//li[contains(@class, 'operation') and text()='To Binary']").to.be.present;
        browser.expect.element("//li[contains(@class, 'operation') and text()='AES Decrypt']").to.be.present;
        browser.expect.element("//li[contains(@class, 'operation') and text()='PEM to Hex']").to.be.present;
        browser.expect.element("//li[contains(@class, 'operation') and text()='Power Set']").to.be.present;
        browser.expect.element("//li[contains(@class, 'operation') and text()='Parse IP range']").to.be.present;
        browser.expect.element("//li[contains(@class, 'operation') and text()='Remove Diacritics']").to.be.present;
        browser.expect.element("//li[contains(@class, 'operation') and text()='Sort']").to.be.present;
        browser.expect.element("//li[contains(@class, 'operation') and text()='To UNIX Timestamp']").to.be.present;
        browser.expect.element("//li[contains(@class, 'operation') and text()='Extract dates']").to.be.present;
        browser.expect.element("//li[contains(@class, 'operation') and text()='Gzip']").to.be.present;
        browser.expect.element("//li[contains(@class, 'operation') and text()='Keccak']").to.be.present;
        browser.expect.element("//li[contains(@class, 'operation') and text()='JSON Beautify']").to.be.present;
        browser.expect.element("//li[contains(@class, 'operation') and text()='Detect File Type']").to.be.present;
        browser.expect.element("//li[contains(@class, 'operation') and text()='Play Media']").to.be.present;
        browser.expect.element("//li[contains(@class, 'operation') and text()='Disassemble x86']").to.be.present;
        browser.expect.element("//li[contains(@class, 'operation') and text()='Register']").to.be.present;
        browser.expect.element("//li[contains(@class, 'operation') and text()='Escape Smart Characters']").to.be.present;

        browser.useCss().click("#close-operation-picker-icon");
    },

    "Operation popover descriptions render HTML safely": browser => {
        const op = "//ul[@id='search-results']//li[contains(@class, 'operation') and contains(., 'Escape Smart Characters')]";

        browser
            .useCss()
            .click("#add-operation")
            .clearValue("#search")
            .setValue("#search", "Escape Smart Characters")
            .useXpath()
            .waitForElementVisible(op, 1000)
            .moveToElement(op, 10, 10)
            .useCss()
            .waitForElementVisible(".popover-body code:last-of-type", 1000)
            .expect.element(".popover-body code:last-of-type").text.to.contain("\"Hello\" -- world...");

        browser
            .useCss()
            .moveToElement("#operation-picker-title", 1, 1)
            .waitForElementNotPresent(".popover-body", 1000)
            .click("#close-operation-picker-icon");
    },

    "Recipe can be run": browser => {
        const toHex = "//li[contains(@class, 'operation') and text()='To Hex']";
        const op = "#rec-list .operation .op-title";

        // Check that operation is visible
        browser
            .useCss()
            .click("#add-operation")
            .clearValue("#search")
            .setValue("#search", "To Hex")
            .useXpath()
            .expect.element(toHex).to.be.visible;

        // Add it to the recipe from the operation picker
        browser
            .useXpath()
            .moveToElement(toHex, 10, 10)
            .useCss()
            .waitForElementVisible(".popover-body", 1000)
            .click("xpath", toHex);

        // Confirm that it has been added to the recipe
        browser
            .useCss()
            .waitForElementVisible(op, 100)
            .expect.element(op).text.to.contain("To Hex");

        // Enter input
        browser
            .useCss()
            .sendKeys("#input-text .cm-content", "Don't Panic.")
            .pause(1000)
            .click("#bake");

        // Check output
        browser
            .useCss()
            .waitForElementNotVisible("#stale-indicator", 1000)
            .expect.element("#output-text .cm-content").text.that.equals("44 6f 6e 27 74 20 50 61 6e 69 63 2e");

        // Clear recipe
        browser
            .useCss()
            .moveToElement(op, 10, 10)
            .waitForElementNotPresent(".popover-body", 1000)
            .click("#clr-recipe")
            .waitForElementNotPresent(op);
    },

    "Recipe operations can be duplicated and removed": browser => {
        const firstOperation = "#rec-list li.operation:nth-of-type(1)",
            secondOperation = "#rec-list li.operation:nth-of-type(2)";

        browser
            .useCss()
            .waitForElementNotPresent("#preloader", 10000)
            .click("#clr-recipe")
            .urlHash("recipe=JWT_Verify('original secret')")
            .waitForElementVisible(`${firstOperation} .duplicate-operation`, 2000)
            .execute(function() {
                const arg = document.querySelector("#rec-list li.operation textarea.arg");
                arg.value = "copied secret";
                arg.dispatchEvent(new Event("input", {bubbles: true}));
            })
            .click(`${firstOperation} .disable-icon`)
            .click(`${firstOperation} .breakpoint`)
            .click(`${firstOperation} .hide-args-icon`)
            .click(`${firstOperation} .duplicate-operation`)
            .waitForElementVisible(`${secondOperation} .remove-operation`, 1000)
            .execute(function() {
                const operations = Array.from(document.querySelectorAll("#rec-list li.operation"));
                return {
                    count: operations.length,
                    config: window.app.getRecipeConfig(),
                    duplicateArgsHidden: operations[1].querySelector(".ingredients").style.display === "none"
                };
            }, [], function({value}) {
                browser.expect(value.count).to.equal(2);
                browser.expect(value.config[1].args[0]).to.equal("copied secret");
                browser.expect(value.config[1].disabled).to.equal(true);
                browser.expect(value.config[1].breakpoint).to.equal(true);
                browser.expect(value.duplicateArgsHidden).to.equal(true);
            })
            .click(`${firstOperation} .remove-operation`)
            .waitForElementNotPresent(secondOperation)
            .expect.element(`${firstOperation} textarea.arg`).to.have.value.that.equals("copied secret");
    },

    /**
     * Dragging an operation that is already in the recipe fires the same dragover and drop events on
     * any text argument it passes over as a text drag from outside the app does. Only the
     * dragInProgress flag tells the two apart, so if the recipe list Sortable stops maintaining it,
     * the operation's title silently overwrites the argument.
     */
    "Recipe operation dragged over a text argument": browser => {
        const secondArg = "#rec-list li.operation:nth-of-type(2) textarea.arg";

        // Two operations, each with a text argument to drop onto
        browser
            .useCss()
            .click("#clr-recipe")
            .urlHash("recipe=JWT_Verify('secret')JWT_Verify('secret')")
            .waitForElementVisible(secondArg, 2000);

        // Control: a text drag from outside the app is still written into the argument, proving the
        // drop handler is reached at all
        browser.execute(function() {
            const arg = document.querySelector("#rec-list li.operation textarea.arg"),
                dataTransfer = new DataTransfer();

            dataTransfer.setData("Text", "dropped text");
            arg.dispatchEvent(new DragEvent("dragover", {bubbles: true, cancelable: true, dataTransfer: dataTransfer}));
            arg.dispatchEvent(new DragEvent("drop", {bubbles: true, cancelable: true, dataTransfer: dataTransfer}));
            return arg.value;
        }, [], function({value}) {
            browser.expect(value).to.equal("dropped text");
        });

        // Start a genuine Sortable drag on the second operation. Sortable itself picks the drag up
        // from the pointerdown and dragstart pair, and fills the dataTransfer from its setData.
        browser.execute(function() {
            const ops = document.querySelectorAll("#rec-list li.operation"),
                handle = ops[1].querySelector(".op-title"),
                rect = handle.getBoundingClientRect();

            window.dragTest = {
                op: ops[1],
                arg: ops[0].querySelector("textarea.arg"),
                dataTransfer: new DataTransfer()
            };
            window.dragTest.arg.value = "not overwritten";

            handle.dispatchEvent(new PointerEvent("pointerdown", {
                bubbles: true,
                cancelable: true,
                pointerType: "mouse",
                button: 0,
                buttons: 1,
                clientX: rect.left + 5,
                clientY: rect.top + 5
            }));
            window.dragTest.op.dispatchEvent(new DragEvent("dragstart", {
                bubbles: true,
                cancelable: true,
                dataTransfer: window.dragTest.dataTransfer,
                clientX: rect.left + 5,
                clientY: rect.top + 5
            }));
        });

        // Sortable raises its start event a tick after the dragstart
        browser
            .pause(100)
            .execute(function() {
                return window.app.manager.recipe.dragInProgress;
            }, [], function({value}) {
                browser.expect(value).to.equal(true);
            });

        // Drag the operation over the other operation's argument and drop it there
        browser.execute(function() {
            const op = window.dragTest.op,
                arg = window.dragTest.arg,
                dataTransfer = window.dragTest.dataTransfer,
                rect = arg.getBoundingClientRect(),
                init = {
                    bubbles: true,
                    cancelable: true,
                    dataTransfer: dataTransfer,
                    clientX: rect.left + 5,
                    clientY: rect.top + 5
                };

            arg.dispatchEvent(new DragEvent("dragover", init));
            arg.dispatchEvent(new DragEvent("drop", init));
            op.dispatchEvent(new DragEvent("dragend", init));

            return {
                argValue: arg.value,
                dragText: dataTransfer.getData("Text"),
                dragInProgress: window.app.manager.recipe.dragInProgress
            };
        }, [], function({value}) {
            // The operation title is what would have been written if the drop were not ignored
            browser.expect(value.dragText).to.equal("JWT Verify");
            browser.expect(value.argValue).to.equal("not overwritten");
            browser.expect(value.dragInProgress).to.equal(false);
        });

        browser
            .click("#clr-recipe")
            .waitForElementNotPresent("#rec-list li.operation");
    },
    "Test every module": browser => {
        browser.useCss();

        // BSON
        loadOp("BSON deserialise", browser)
            .waitForElementNotVisible("#output-loader", 5000);

        // Charts
        loadOp("Entropy", browser)
            .waitForElementNotVisible("#output-loader", 5000);

        // Ciphers
        loadOp("AES Encrypt", browser)
            .waitForElementNotVisible("#output-loader", 5000);

        // Code
        loadOp("XPath expression", browser)
            .waitForElementNotVisible("#output-loader", 5000);

        // Compression
        loadOp("Gzip", browser)
            .waitForElementNotVisible("#output-loader", 5000);

        // Crypto
        loadOp("MD5", browser)
            .waitForElementNotVisible("#output-loader", 5000);

        // Default
        loadOp("Fork", browser)
            .waitForElementNotVisible("#output-loader", 5000);

        // Diff
        loadOp("Diff", browser)
            .waitForElementNotVisible("#output-loader", 5000);

        // Encodings
        loadOp("Encode text", browser)
            .waitForElementNotVisible("#output-loader", 5000);

        // Hashing
        loadOp("Streebog", browser)
            .waitForElementNotVisible("#output-loader", 5000);

        // Image
        loadOp("Extract EXIF", browser)
            .waitForElementNotVisible("#output-loader", 5000);

        // PGP
        loadOp("PGP Encrypt", browser)
            .waitForElementNotVisible("#output-loader", 5000);

        // PublicKey
        loadOp("Hex to PEM", browser)
            .waitForElementNotVisible("#output-loader", 5000);

        // Regex
        loadOp("Strings", browser)
            .waitForElementNotVisible("#output-loader", 5000);

        // Shellcode
        loadOp("Disassemble x86", browser)
            .waitForElementNotVisible("#output-loader", 5000);

        // URL
        loadOp("URL Encode", browser)
            .waitForElementNotVisible("#output-loader", 5000);

        // UserAgent
        loadOp("Parse User Agent", browser)
            .waitForElementNotVisible("#output-loader", 5000);

        // YARA
        loadOp("YARA Rules", browser)
            .waitForElementNotVisible("#output-loader", 5000);

        browser.click("#clr-recipe");
    },

    "Move around the UI": browser => {
        const genUUID = "//li[contains(@class, 'operation') and text()='Generate UUID']";

        browser
            .useCss()
            .waitForElementNotVisible("#snackbar-container", 10000)
            .click("#add-operation")
            .setValue("#search", "Generate UUID")
            .useXpath()
            .expect.element(genUUID).to.be.visible;

        // Add op to recipe
        browser
            .getLocationInView(genUUID)
            .moveToElement(genUUID, 10, 10)
            .click(genUUID)
            .useCss()
            .waitForElementVisible(".operation .op-title", 1000)
            .waitForElementNotVisible("#stale-indicator", 1000)
            .expect.element("#output-text .cm-content").text.which.matches(/[\da-f-]{36}/);

        browser.click("#clr-recipe");
    },

    "Search": browser => {
        // Search for an op
        browser
            .useCss()
            .click("#add-operation")
            .clearValue("#search")
            .setValue("#search", "md5")
            .useXpath()
            .waitForElementVisible("//ul[@id='search-results']//b[text()='MD5']", 1000)
            .click("//ul[@id='search-results']//b[text()='MD5']")
            .useCss()
            .execute(function() {
                return document.querySelectorAll("#rec-list li.operation").length;
            }, [], function({value}) {
                browser.expect(value).to.equal(1);
            })
            .click("#clr-recipe");
    },

    "Recipe sidebar can be folded": browser => {
        browser
            .useCss()
            .click("#collapse-recipe")
            .waitForElementVisible("#expand-recipe", 1000)
            .expect.element("body").to.have.attribute("class").which.contains("recipe-collapsed");

        browser.execute(function() {
            const ioRect = document.getElementById("IO").getBoundingClientRect();
            return {
                documentHeight: document.documentElement.scrollHeight,
                ioTop: ioRect.top,
                ioWidth: ioRect.width,
                viewportHeight: window.innerHeight,
                viewportWidth: window.innerWidth
            };
        }, [], function({value}) {
            browser.expect(value.ioTop).to.equal(0);
            browser.expect(value.ioWidth).to.equal(value.viewportWidth);
            browser.expect(value.documentHeight).to.equal(value.viewportHeight);
        });

        browser
            .click("#expand-recipe")
            .waitForElementNotVisible("#expand-recipe", 1000);
    },

    "Mobile recipe drawer can be dismissed": browser => {
        browser
            .resizeWindow(390, 844)
            .waitForElementVisible("#expand-recipe", 1000)
            .click("#expand-recipe")
            .waitForElementVisible("#recipe-drawer-backdrop", 1000)
            .keys(browser.Keys.ESCAPE)
            .waitForElementNotVisible("#recipe-drawer-backdrop", 1000)
            .click("#expand-recipe")
            .waitForElementVisible("#recipe-drawer-backdrop", 1000)
            .click("#recipe-drawer-backdrop")
            .waitForElementNotVisible("#recipe-drawer-backdrop", 1000)
            .resizeWindow(1280, 800);
    },

    "Alert bar": browser => {
        // Bake nothing to create an empty output which can be copied
        utils.clear(browser);
        utils.bake(browser);

        // Alert bar shows and contains correct content
        browser
            .waitForElementNotVisible("#snackbar-container")
            .click("#copy-output")
            .waitForElementVisible("#snackbar-container .snackbar-content")
            .expect.element("#snackbar-container .snackbar-content").text.to.equal("Copied raw output successfully.");

        // Alert bar disappears after the correct amount of time
        // Should disappear after 2000ms
        browser
            .waitForElementNotPresent("#snackbar-container .snackbar-content", 2500)
            .waitForElementNotVisible("#snackbar-container");
    },

    after: browser => {
        browser.end();
    }
};

/**
 * Clears the current recipe and loads a new operation.
 *
 * @param {string} opName
 * @param {Browser} browser
 */
function loadOp(opName, browser) {
    return browser
        .useCss()
        .click("#clr-recipe")
        .urlHash("op=" + opName);
}
