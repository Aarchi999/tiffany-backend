const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const AppleStrategy = require("passport-apple");

const { users, user_auth_providers, sequelize } = require("../models");

/* ---------------------------------------------------
   COMMON FIND / CREATE USER / IF DELETED THEN RESTORE
--------------------------------------------------- */

const findOrCreateUser = async ({
  provider,
  providerUserId,
  email,
  name,
  transaction
}) => {

  let auth = await user_auth_providers.findOne({
    where: {
      provider,
      provider_user_id: providerUserId
    },
    paranoid: false,
    include: [{ model: users, as: "user" }],
    transaction
  });

  // Restore soft-deleted provider + user
  if (auth && auth.deleted_at) {
    await auth.restore({ transaction });

    if (auth.user?.deleted_at) {
      await auth.user.restore({ transaction });
    }

    return auth.user;
  }

  // Provider exists
  if (auth) return auth.user;

  let user = null;

  if (email) {
    user = await users.findOne({
      where: { email, deleted_at: null },
      transaction
    });
  }

  if (!user) {
    user = await users.create({
      name,
      email,
      password_hash: null,
      is_active: '1'
    }, { transaction });
  }

  await user_auth_providers.create({
    user_id: user.id,
    provider,
    provider_user_id: providerUserId,
    email
  }, { transaction });

  return user;
};



/* ---------------------------------------------------
   GOOGLE STRATEGY
--------------------------------------------------- */
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await findOrCreateUser({
          provider: "google",
          providerUserId: profile.id,
          email: profile.emails?.[0]?.value || null,
          name: profile.displayName || null
        });
        done(null, user);
      } catch (err) {
        done(err);
      }
    }
  )
);

/* ---------------------------------------------------
   APPLE STRATEGY
--------------------------------------------------- */
passport.use(
  new AppleStrategy(
    {
      clientID: process.env.APPLE_CLIENT_ID,
      teamID: process.env.APPLE_TEAM_ID,
      keyID: process.env.APPLE_KEY_ID,
      privateKeyString: process.env.APPLE_PRIVATE_KEY,
      callbackURL: "/auth/apple/callback"
    },
    async (accessToken, refreshToken, idToken, profile, done) => {
      try {
        const user = await findOrCreateUser({
          provider: "apple",
          providerUserId: idToken.sub,
          email: idToken.email || null,
          name: profile?.name
            ? `${profile.name.firstName || ""} ${profile.name.lastName || ""}`.trim()
            : null
        });
        done(null, user);
      } catch (err) {
        done(err);
      }
    }
  )
);

module.exports = {
  passport,
  findOrCreateUser
};
