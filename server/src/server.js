import cron from "node-cron";
import app from "./app.js";
import { runDailyPerformanceMonitoring } from "./services/performanceMonitoringService.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Pulls one day of Meta Insights for every ACTIVE, Meta-launched campaign
// across every company, once a day. See performanceMonitoringService.js.
cron.schedule(
  "0 0 * * *",
  () => {
    runDailyPerformanceMonitoring()
      .then((summary) => console.log("Daily performance monitoring completed:", summary))
      .catch((error) => console.error("Daily performance monitoring job failed:", error));
  },
  { timezone: "Asia/Kuala_Lumpur" }
);
