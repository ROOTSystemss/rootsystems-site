require("dotenv").config({ path: ".env.local", quiet: true });

const app = require("./app");
const { purgeExpiredSubmissions } = require("./services/contactService");

const PORT = process.env.PORT || 4300;

app.listen(PORT, () => {
  console.log(`RootSystems site running at http://localhost:${PORT}`);
});

// 90-day retention for contact submissions: purge at startup and once a day.
function runPurge() {
  purgeExpiredSubmissions()
    .then((removed) => { if (removed) console.log(`[contact] purged ${removed} submission(s) older than 90 days`); })
    .catch((error) => console.error("[contact] retention purge failed:", error.message));
}
runPurge();
setInterval(runPurge, 24 * 60 * 60 * 1000).unref();
