import { test, expect, Page, Response } from "@playwright/test";
import { UsageData, convertReadingToCsv } from "../helpers/usageDataSchema";
import { appendToFile } from "../helpers/file";
import dotenv from 'dotenv';

dotenv.config();

let currentAuraResponse: Response | null = null;

const email = process.env.EMAIL;

if (!email) {
  throw new Error("EMAIL environment variable is not set");
}

const password = process.env.PASSWORD;

if (!password) {
  throw new Error("EMAIL environment variable is not set");
}

const daysToExtract = Number.parseInt(process.env.DAYS_TO_EXTRACT);

if (!daysToExtract) {
  throw new Error("DAYS_TO_EXTRACT environment variable is not set");
}

test("extract usage", async ({ page }) => {
  test.setTimeout(0);

  page.on("response", async (response) => {
    const responseUrl = response.url();
    if (responseUrl.includes("/s/sfsites/aura") && responseUrl.includes("other.cm_AccountBillingUsageAURA.getDigitalMeterUsage=1")) {
      currentAuraResponse = response;
    }
  });

  // login
  await page.goto("https://my.southeastwater.com.au/s/");
  await page.getByLabel("*Email*").click();
  await page.getByLabel("*Email*").fill(email);
  await page.getByLabel("*Password*").click();
  await page.getByLabel("*Password*").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();

  // switch to usage page
  await page.getByRole("menuitem", { name: "Usage" }).click();
  await page.getByText("Water usage detail").waitFor({ state: "visible" });

  // wait for the loader spinner to disappear
  await waitForSpinners(page);

  // the page loader seems to sometimes take a while, so wait a bit longer for things to settle
  await page.waitForTimeout(2000);

  // change to daily data
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
  while (true) {
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
  for (let i = 0; i < daysToExtract; i++) {
    // get current date
    const currentDateText = await getDateText(page);
    const currentDate = new Date(currentDateText ?? '');

    if (Number.isNaN(currentDate.getTime())) {
      throw new Error("Date is not valid");
    }

    if (!currentAuraResponse) {
      throw new Error("No aura response found");
    }

    // response from the aura call
    const responseJson = await currentAuraResponse.json();

    // get the usage data
    const returnValueString = responseJson.actions[0].returnValue;
    const returnValueJson = JSON.parse(returnValueString);
    const usageDataJson = JSON.parse(returnValueJson.usage)[0] as UsageData;

    // write the usage data to a file
    appendToFile("usage.csv", usageDataJson.Readings.map((reading) => convertReadingToCsv(reading)).join("\n"));

    // reset the aura response
    currentAuraResponse = null;

    // go to the previous date
    await page.locator('button[name="dateLeft"]').click();
    await waitForSpinners(page);
  }
});

async function waitForSpinners(page: Page) {
  const allSpinners = await page.locator("lightning-spinner").all();
  await Promise.all(
    allSpinners.map((spinner) => spinner.waitFor({ state: "hidden" }))
  );
}

async function getDateText(page: Page) {
  return await page.locator("lightning-formatted-text").textContent();
}
