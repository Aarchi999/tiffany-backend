'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'users',
      [
        {
          id: 1,
          name: 'Developer Admin',
          email: 'developeradmin@gmail.com',
          password_hash:
            '$2b$10$tdgoTezZwIymZ77ObprdoOpOPRTH1iNFK1e8XKNmVRRewCzGW3WPu',
          is_active: '1',
          failed_login_attempts: 0,
          created_at: '2025-08-28 12:12:25',
          updated_at: '2026-01-08 07:33:19'
        },
        {
          id: 2,
          name: 'Super Admin',
          email: 'superadmin@gmail.com',
          password_hash:
            '$2b$10$tdgoTezZwIymZ77ObprdoOpOPRTH1iNFK1e8XKNmVRRewCzGW3WPu',
          is_active: '1',
          failed_login_attempts: 0,
          created_at: '2025-08-28 12:12:25',
          updated_at: '2026-01-08 07:33:19'
        }
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', {
      id: [1, 2]
    });
  }
};
