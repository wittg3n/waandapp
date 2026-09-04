import mongoose from 'mongoose';

export const cmsConnection = mongoose.createConnection();

let listenersConfigured = false;

function connectionOptions(databaseName) {
  return {
    ...(databaseName ? { dbName: databaseName } : {}),
    autoCreate: false,
    autoIndex: false,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5_000,
  };
}

export async function connectMongoDb(uri, logger, databaseNames = {}) {
  mongoose.set('sanitizeFilter', true);
  mongoose.set('strictQuery', true);
  mongoose.set('bufferCommands', false);

  if (!listenersConfigured) {
    mongoose.connection.on('error', (error) => {
      logger.error({ err: error, database: 'core' }, 'MongoDB connection error');
    });
    cmsConnection.on('error', (error) => {
      logger.error({ err: error, database: 'cms' }, 'MongoDB connection error');
    });
    listenersConfigured = true;
  }

  await mongoose.connect(uri, connectionOptions(databaseNames.coreDatabase));
  const cmsDatabase =
    databaseNames.cmsDatabase ?? `${mongoose.connection.db?.databaseName ?? 'waandapp'}_cms`;
  await cmsConnection.openUri(uri, connectionOptions(cmsDatabase));

  logger.info(
    {
      coreDatabase: mongoose.connection.db?.databaseName,
      cmsDatabase: cmsConnection.db?.databaseName,
    },
    'MongoDB connections ready',
  );
}

export async function disconnectMongoDb() {
  await Promise.all([
    cmsConnection.readyState === 0 ? Promise.resolve() : cmsConnection.close(),
    mongoose.connection.readyState === 0 ? Promise.resolve() : mongoose.disconnect(),
  ]);
}

async function ping(connection, label) {
  const database = connection.db;
  if (connection.readyState !== 1 || !database) {
    throw new Error(`${label} MongoDB is not ready.`);
  }
  await database.admin().ping();
}

export const pingCoreMongoDb = () => ping(mongoose.connection, 'Core');
export const pingCmsMongoDb = () => ping(cmsConnection, 'CMS');

// Kept for existing callers; Core remains the default Mongoose connection.
export const pingMongoDb = pingCoreMongoDb;
