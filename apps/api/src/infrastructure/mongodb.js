import mongoose from 'mongoose';

export async function connectMongoDb(uri, logger) {
  mongoose.set('sanitizeFilter', true);
  mongoose.set('strictQuery', true);
  mongoose.set('bufferCommands', false);
  mongoose.connection.on('error', (error) => {
    logger.error({ err: error }, 'MongoDB connection error');
  });

  await mongoose.connect(uri, {
    autoCreate: false,
    autoIndex: false,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5_000,
  });

  logger.info('MongoDB connected');
}

export async function disconnectMongoDb() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

export async function pingMongoDb() {
  const database = mongoose.connection.db;

  if (mongoose.connection.readyState !== 1 || !database) {
    throw new Error('MongoDB is not ready.');
  }

  await database.admin().ping();
}
