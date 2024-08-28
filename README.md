# Travisso Auto-Reservation

Puppeteer Headless Chrome Auto-Reservation system for sweet life after works. Clone this repo and run them directy with a simple `node` command.

```bash
git clone https://github.com/GaiaMom/auto-reservation
cd auto-reservation
npm i --legacy-peer
npm i -g npx && npx puppeteer browsers install chromeclear
node reserve.js
```
You can run these scripts in the [puppeteer sandbox](https://puppeteersandbox.com).

```
Use `puppeteer` script to get `__RequestVerificationToken` after sign in https://app.travisso.com site.
Axios call will reserve pitch for pitfalls and tennis on pre-defined every weekdays.