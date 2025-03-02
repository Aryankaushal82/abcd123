const Agenda = require('agenda');
const mongoose = require('mongoose');
const { logger } = require('../utils/logger');
const { defineJobs } = require('./jobs');
require('dotenv').config();

// Setup Agenda instance
exports.setupAgenda = () => {
  // Create Agenda instance
  const agenda = new Agenda({
    db: {
      address: process.env.MONGODB_URI || 'mongodb://localhost:27017/social-media-scheduler',
      collection: process.env.AGENDA_DB_COLLECTION || 'agendaJobs',
      options: { useUnifiedTopology: true }
    },
    processEvery: '1 minute'
  });

  // Define jobs
  defineJobs(agenda);

  // Handle errors
  agenda.on('error', (err) => {
    logger.error('Agenda error:', err);
  });

  // Log job completion
  agenda.on('complete', (job) => {
    logger.info(`Job ${job.attrs.name} completed for id: ${job.attrs._id}`);
  });

  // Log job failures
  agenda.on('fail', (err, job) => {
    logger.error(`Job ${job.attrs.name} failed with error: ${err.message}`);
  });

  // Start Agenda
  agenda.start();
  logger.info('Agenda started');

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    logger.info('Stopping Agenda...');
    await agenda.stop();
    logger.info('Agenda stopped');
    process.exit(0);
  });

  return agenda;
};



