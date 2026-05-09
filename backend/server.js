require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db.config');
const scheduler = require('./cron/scheduler');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    console.log('✅ MongoDB Atlas connected');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    });

    // Start cron scheduler after DB is ready
    scheduler.start();
    console.log('⏰ Cron scheduler started (fetches every 30 minutes)');
  } catch (err) {
    console.error('❌ Server startup failed:', err.message);
    process.exit(1);
  }
};

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  process.exit(1);
});

startServer();
