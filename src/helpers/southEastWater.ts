import type { Page, Response } from 'playwright';
import { chromium, devices } from 'playwright';
import type { UsageData } from './auraApi.js';
import { parseAuraResponse } from './auraApi.js';
import { expect } from '@playwright/test';

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
    onUsageData: (usageData: UsageData) => Promise<void>;
}) {
    const browser = await chromium.launch();
    const context = await browser.newContext(devices['Desktop Chrome']);
    const page = await context.newPage();

    page.on('response', (response) => {
        const responseUrl = response.url();
        if (
            responseUrl.includes('/s/sfsites/aura') &&
            responseUrl.includes('aura.ApexAction.execute=1')
        ) {
            currentAuraResponse = response;
        }
    });

    // login
    console.log('Logging into my.southeastwater.com.au');
    await page.goto('https://my.southeastwater.com.au/s/');
    await page.getByLabel('*Email*').fill(email);
    await page.getByLabel('*Password*').fill(password);
    await page.getByRole('button', { name: 'Sign in' }).click();

    // switch to usage page
    console.log('Navigating to water usage details');
    await page.getByRole('menuitem', { name: 'Usage' }).click();
    await page
        .getByRole('heading', { name: 'Water usage' })
        .waitFor({ state: 'visible' });

    // wait for the loader spinner to disappear
    await waitForSpinners(page);

    // the page loader seems to sometimes take a while, so wait a bit longer for things to settle
    await page.waitForTimeout(2000);

    console.log('Verify "Day" tab is selected');
    const dayButton = page.getByRole('button', { name: 'Day' });
    await expect(dayButton).toHaveClass(/active/);

    await waitForSpinners(page);

    // the daily button click seems to sometimes take a while, so wait a bit longer for things to settle
    await page.waitForTimeout(2000);

    // go to the newest date available
    // the date picker has a max date which is usually today
    // the server will redirect to the newest date the data is available (usually the day before)
    console.log('Finding when the latest data is available');
    const maxDateAttribute = await dateTextLocator(page).getAttribute('max');

    if (!maxDateAttribute) {
        throw new Error('Max date not found');
    }

    await goToDate(page, maxDateAttribute);

    const latestDataDate = await getDateText(page);
    console.log(`Latest data date: ${latestDataDate}`);

    // process current date and go backwards in the last 30 days
    console.log(`Extracting ${daysToExtract} days of data`);
    const result: UsageData[] = [];

    for (let i = 0; i < daysToExtract; i++) {
        // calculate date string
        const date = new Date(latestDataDate);
        date.setDate(date.getDate() - i);
        const dateString =
            date.getFullYear() +
            '-' +
            (date.getMonth() + 1).toString().padStart(2, '0') +
            '-' +
            date.getDate().toString().padStart(2, '0');

        console.log(`Processing ${dateString} - ${i + 1} of ${daysToExtract}`);

        // switching to date
        await goToDate(page, dateString);

        await waitForSpinners(page);

        const dateText = await getDateText(page);
        if (dateText !== dateString) {
            throw new Error(
                `Requested date does not match date on page ${dateText}`,
            );
        }

        if (!currentAuraResponse) {
            throw new Error('No aura response found');
        }

        // response from the aura call
        const usageData = await parseAuraResponse(currentAuraResponse);

        result.push(usageData);

        await onUsageData(usageData);

        // reset the aura response
        currentAuraResponse = null;
    }

    await context.close();
    await browser.close();

    return result;
}

async function waitForSpinners(page: Page) {
    const allSpinners = await page.locator('lightning-spinner').all();
    await Promise.all(
        allSpinners.map((spinner) => spinner.waitFor({ state: 'hidden' })),
    );
}

function dateTextLocator(page: Page) {
    return page.locator('input[name="dateSelect"]');
}

async function getDateText(page: Page) {
    return await dateTextLocator(page).inputValue();
}

async function goToDate(page: Page, date: string) {
    return await dateTextLocator(page).fill(date);
}
