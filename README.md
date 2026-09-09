# PolarGrid 

Build a frontend dashboard called "PolarGrid AI" — an AI-driven energy management system dashboard for polar research stations. I'm attaching a full specification document (polargrid-ai-dashboard-spec.md) — follow it closely.

Key requirements:

1. Sidebar navigation with these pages: Overview, Forecasting, AI Dispatch, Energy Sources, KPIs & Sustainability, Equipment Health, Communications, Settings/Scenario Simulator.

2. Use the JSON data structure from Section 5 of the spec as the shape for mock data. Create a mock data simulator that updates values every 3-5 seconds with small random-walk variations, so numbers feel live — no real backend needed.

3. Overview page (make this the most polished):

   - An animated power-flow diagram showing energy flowing from Solar, Wind, Diesel, Battery, and Fuel Cell into a central Bus, then out to Station Loads. Use line thickness or animated flow direction to represent power magnitude and charge/discharge direction.

   - Key metrics cards: renewable fraction %, battery state of charge, current load, diesel status, outdoor temp & wind speed.

   - An alerts/notifications panel showing active warnings.

4. AI Dispatch page: show the current dispatch decision in plain language (e.g. "Charging battery from solar surplus; diesel on standby"), plus a stacked area or timeline chart of planned dispatch for the next 24 hours.

5. KPIs & Sustainability page: gauge/radial charts for renewable utilization %, a cumulative diesel usage trend chart, a CO2 avoided counter, and uptime %.

6. Scenario Simulator (Settings page): buttons for "Simulate Storm" and "Simulate Comms Outage" that visibly change the Overview page in real time — trigger new alerts, shift the power flow (e.g. diesel spins up, wind output drops), and flip the connectivity status indicator.

7. Design: dark mode by default (control-room aesthetic), color-coded status (green = normal/renewable, amber = warning/standby, red = critical/offline, blue = forecast/informational), clean technical sans-serif typography, card-based grid layout.

Prioritize a visually strong, interactive demo for a hackathon presentation — Overview, AI Dispatch, and KPIs pages matter most. Other pages (Forecasting, Energy Sources detail, Equipment Health, Communications) can be simpler/lighter but should still exist and be navigable.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/2886de82-c4c5-423c-bd99-e30839731f65).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
