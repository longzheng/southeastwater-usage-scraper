# Automatically scrape/extract South East Water water usage data

South East Water introduced [digital water meters](https://southeastwater.com.au/residential/upgrades-and-projects/projects/digital-water-meters/) which record water usage data every hour. This data is available to customers through the South East Water website however the website only displays hourly data on a day-by-day basis and does not provide any export or APIs to access the data across a long time range.

This script will automatically scrape the water usage data from the South East Water website and save it to a CSV file (and optionally InfluxDB).

The script uses [Playwright](https://playwright.dev/) and a headless browser to
- log in to the https://my.southeastwater.com.au/ customer portal
- navigate to the usage page
- click on the "daily" tab
- go to the latest day (usually data is available up to yesterday)
- go back day by day over the last 30 days scrape/extract the data from the network responses
- save the data to a `usage.csv` CSV file

Example
```csv
Timestamp,Date,Hour,MeasurementLitres
2024-06-05T00:00:00,2024-06-04,0,4
2024-06-05T01:00:00,2024-06-04,1,3
2024-06-05T02:00:00,2024-06-04,2,4
2024-06-05T03:00:00,2024-06-04,3,4
```

### How to use

> [!CAUTION]
> This is a proof of concept, is not thoroughly tested and may break if the South East Water website changes. Use at your own risk.

1. Install dependencies `npm install`
1. Copy `.env.example` to `.env` and fill in South East Water account email and password (and optionally InfluxDB connection details)
1. Run `npm run start`

### InfluxDB

If configured, the script will write records with
- measurement: `water`
- timestamp: the hour of the reading
- field: `litres` with the water usage in litres

You can query this data with Flux, for example to get a report of the average water usage by hour of the day and the days of the week

```flux
import "date"

days_of_week = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

from(bucket: "bucket")
  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
  |> filter(fn: (r) => r._measurement == "water")
  |> map(fn: (r) => ({
    r with 
    day_of_week: date.weekDay(t: r._time), 
    hour_of_day: date.hour(t: r._time)
  }))
  |> map(fn: (r) => ({
    r with 
    day: days_of_week[r.day_of_week]
  }))
  |> group(columns: ["day", "hour_of_day"])
  |> mean(column: "_value")
  |> group()
  |> pivot(
    rowKey: ["hour_of_day"],
    columnKey: ["day"],
    valueColumn: "_value"
  )
```
