// Runs inside the throwaway stack's backend container (see tests/e2e/docker-compose.yml), after the
// migrations and before the server starts. Creates the users in users.json with fixed UUIDs, so
// tests/e2e/support/auth.ts can sign login tokens for them without asking the database.
//
// Safe to run again: existing users are reset to the values in users.json.
const path = require('path');

const users = require('./users.json');

// The working directory is the backend checkout (/var/www/membership-portal).
const backend = (file) => require(path.join(process.cwd(), file));
const mongoose = backend('node_modules/mongoose');
const { User, db } = backend('app/db');
const { Committee } = backend('app/api/v1/internship/models/Committee');

// Officers can only belong to committees that exist in Mongo, but the backend's dev seed (which
// creates the real committees) only runs once the server starts, after this script. So create
// just the committee names officers need. The dev seed fills in the rest of each committee later.
const ensureCommittees = async (names) => {
  if (names.length === 0) return;
  await mongoose.connect(process.env.MONGODB_URI);
  await Promise.all(names.map((name) => Committee.updateOne(
    { name },
    { $setOnInsert: { name, displayName: name } },
    { upsert: true },
  )));
};

const seed = async () => {
  await ensureCommittees([...new Set(Object.values(users).flatMap((u) => u.committees || []))]);

  for (const [role, user] of Object.entries(users)) {
    const values = {
      state: 'ACTIVE', // fully registered unless users.json says otherwise (e.g. "PENDING")
      year: 3,
      major: 'Computer Science',
      committees: [],
      ...user,
    };
    const existing = await User.findOne({ where: { email: user.email } });
    if (existing) await existing.update(values);
    else await User.create(values);
    console.log(`[e2e] seeded ${role}: ${user.email} (${values.accessType}, ${values.state})`);
  }
};

seed()
  .then(() => Promise.all([db.close(), mongoose.disconnect()]))
  .catch((err) => {
    console.error('[e2e] seeding users failed:', err);
    process.exit(1);
  });
