# Automatically scrape/extract South East Water water usage data

South East Water introduced [digital water meters](https://southeastwater.com.au/residential/upgrades-and-projects/projects/digital-water-meters/) which record water usage data every hour. This data is available to customers through the South East Water website however the website only displays hourly data on a day-by-day basis and does not provide any export or APIs to access the data across a long time range.

This script will automatically scrape the water usage data from the South East Water website and save it to a CSV file.

The script uses [Playwright](https://playwright.dev/) and a headless browser to
- log in to the https://my.southeastwater.com.au/ customer portal
- navigate to the usage page
- click on the "daily" tab
- go to the latest day (usually data is available up to yesterday)
- go back day by day over the last 30 days scrape/extract the data from the network responses
- save the data to a `usage.csv` CSV file

Example
```csv
2024-05-08T15:00:00.000,3
2024-05-08T16:00:00.000,3
2024-05-08T17:00:00.000,8
2024-05-08T18:00:00.000,5
```

### How to use

[!CAUTION]
This is a proof of concept, is not thoroughly tested and may break if the South East Water website changes. Use at your own risk.

1. Install dependencies `npm install`
2. Install Playwright browsers `npx playwright install --with-deps`
3. Copy `.env.example` to `.env` and fill in South East Water account email and password
4. Run test `npx playwright test` (or `npx playwright test --headed` to see what's going on)