import { isDeepStrictEqual } from 'node:util';

import mongoose from 'mongoose';

import { AUTH_INDEX_DEFINITIONS } from './index-names.js';
import { ApplicantProfile } from './models/applicant-profile.js';
import { AuthChallenge } from './models/auth-challenge.js';
import { AuthEvent } from './models/auth-event.js';
import { AuthTransaction } from './models/auth-transaction.js';
import { LegalAcceptance } from './models/legal-acceptance.js';
import { User } from './models/user.js';

const requiredIndexes = [
  { definitions: AUTH_INDEX_DEFINITIONS.user, model: User },
  { definitions: AUTH_INDEX_DEFINITIONS.transaction, model: AuthTransaction },
  { definitions: AUTH_INDEX_DEFINITIONS.challenge, model: AuthChallenge },
  { definitions: AUTH_INDEX_DEFINITIONS.profile, model: ApplicantProfile },
  { definitions: AUTH_INDEX_DEFINITIONS.legal, model: LegalAcceptance },
  { definitions: AUTH_INDEX_DEFINITIONS.event, model: AuthEvent },
  { collectionName: 'sessions', definitions: AUTH_INDEX_DEFINITIONS.session },
  { collectionName: 'admin_sessions', definitions: AUTH_INDEX_DEFINITIONS.adminSession },
];

function collectionFor({ collectionName, model }) {
  return model?.collection ?? mongoose.connection.db.collection(collectionName);
}

function semanticOptions(index) {
  return {
    unique: index.unique === true,
    sparse: index.sparse === true,
    hidden: index.hidden === true,
    prepareUnique: index.prepareUnique === true,
    expireAfterSeconds: index.expireAfterSeconds ?? null,
    partialFilterExpression: index.partialFilterExpression ?? null,
    collation: index.collation ?? null,
  };
}

function matchesDefinition(index, definition) {
  return (
    isDeepStrictEqual(Object.entries(index.key), Object.entries(definition.key)) &&
    isDeepStrictEqual(semanticOptions(index), semanticOptions(definition.options))
  );
}

export async function createAuthIndexes() {
  await Promise.all(
    requiredIndexes.flatMap((entry) =>
      entry.model
        ? [entry.model.createIndexes()]
        : entry.definitions.map(({ key, options }) =>
            collectionFor(entry).createIndex(key, options),
          ),
    ),
  );
}

export async function verifyAuthIndexes() {
  const missing = [];
  const mismatched = [];

  for (const entry of requiredIndexes) {
    const { definitions } = entry;
    const collection = collectionFor(entry);
    let existing = [];
    try {
      existing = await collection.listIndexes().toArray();
    } catch (error) {
      if (error?.code !== 26 && error?.codeName !== 'NamespaceNotFound') throw error;
    }

    for (const definition of definitions) {
      const index = existing.find(({ name }) => name === definition.options.name);
      const label = `${collection.collectionName}.${definition.options.name}`;
      if (!index) missing.push(label);
      else if (!matchesDefinition(index, definition)) mismatched.push(label);
    }
  }

  if (missing.length > 0 || mismatched.length > 0) {
    const issues = [...missing, ...mismatched];
    throw new Error(
      `Required authentication or session indexes are missing or invalid: ${issues.join(', ')}. Run db:indexes for missing indexes; invalid same-name indexes require a reviewed drop/rebuild migration.`,
    );
  }
}
