import { chromium, devices, Page, Response } from "playwright";
import { UsageSchema, parseAuraResponse } from "./auraApi";

let currentAuraResponse: Response | null = null;

export async function getSouthEastWaterUsage({
    email,
    password,
    daysToExtract,
    onUsageData,
}: {
    email: string;
    password: string;
    daysToExtract: number;
    onUsageData: (usageData: UsageSchema) => Promise<void>;
}) {
    const browser = await chromium.launch();
    const context = await browser.newContext(devices["Desktop Chrome"]);
    const page = await context.newPage();

    page.on("response", (response) => {
        const responseUrl = response.url();
        if (
            responseUrl.includes("/s/sfsites/aura") &&
            responseUrl.includes(
                "other.cm_AccountBillingUsageAURA.getDigitalMeterUsage=1",
            )
        ) {
            currentAuraResponse = response;
        }
    });

    // login
    console.log("Logging into my.southeastwater.com.au");
    await page.goto("https://my.southeastwater.com.au/s/");
    await page.getByLabel("*Email*").click();
    await page.getByLabel("*Email*").fill(email);
    await page.getByLabel("*Password*").click();
    await page.getByLabel("*Password*").fill(password);
    await page.getByRole("button", { name: "Sign in" }).click();

    // switch to usage page
    console.log("Navigating to water usage details");
    await page.getByRole("menuitem", { name: "Usage" }).click();
    await page.getByText("Water usage detail").waitFor({ state: "visible" });

    // wait for the loader spinner to disappear
    await waitForSpinners(page);

    // the page loader seems to sometimes take a while, so wait a bit longer for things to settle
    await page.waitForTimeout(2000);

    // change to daily data
    console.log("Navigating to daily water usage");
    await page.getByRole("button", { name: "Daily" }).click();

    await waitForSpinners(page);

    // the daily button click seems to sometimes take a while, so wait a bit longer for things to settle
    await page.waitForTimeout(2000);

    // assert that we are looking at daily data
    if ((await getDateText(page))?.includes(" - ")) {
        throw new Error("date has range, is not daily");
    }

    // go to the newest date available
    // loop to click the "next date" button until it is no longer on the page
    console.log("Navigating to the newest date");
    for (;;) {
        await waitForSpinners(page);

        const nextDateButton = page.locator('button[name="dateRight"]');
        const nextDateButtonCount = await nextDateButton.count();

        if (nextDateButtonCount === 0) {
            break;
        }

        await nextDateButton.click();

        await waitForSpinners(page);
    }

    // process current date and go backwards in the last 30 days
    console.log(`Extracting ${daysToExtract} days of data`);
    const result: UsageSchema[] = [];
    for (let i = 0; i < daysToExtract; i++) {
        // get current date
        const currentDateText = await getDateText(page);
        const currentDate = new Date(currentDateText ?? "");
        console.log(
            `Processing ${currentDate.toDateString()} - ${i + 1} of ${daysToExtract}`,
        );

        if (Number.isNaN(currentDate.getTime())) {
            throw new Error("Date is not valid");
        }

        if (!currentAuraResponse) {
            throw new Error("No aura response found");
        }

        // response from the aura call
        const usageData = await parseAuraResponse(currentAuraResponse);

        result.push(usageData);

        await onUsageData(usageData);

        // reset the aura response
        currentAuraResponse = null;

        // go to the previous date
        await page.locator('button[name="dateLeft"]').click();
        await waitForSpinners(page);
    }

    await context.close();
    await browser.close();

    return result;
}

async function waitForSpinners(page: Page) {
    const allSpinners = await page.locator("lightning-spinner").all();
    await Promise.all(
        allSpinners.map((spinner) => spinner.waitFor({ state: "hidden" })),
    );
}

async function getDateText(page: Page) {
    return await page.locator("lightning-formatted-text").textContent();
}
