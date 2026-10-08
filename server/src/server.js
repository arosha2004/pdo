require('dotenv').config();
const app = require('./app');

const { startEmailWorker } = require('./jobs/worker');
const { startRemindersJob } = require('./jobs/reminders');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  startEmailWorker();
  startRemindersJob();
});
