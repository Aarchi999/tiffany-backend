'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'user_roles',
      [
        {
          id: 1,
          user_id: 1,
          role_id: 1,
          assigned_by: null,
          created_at: '2025-09-15 13:14:52',
          updated_at: '2025-09-15 13:14:52'
        },
        {
          id: 2,
          user_id: 2,
          role_id: 2,
          assigned_by: null,
          created_at: '2025-10-06 06:42:14',
          updated_at: '2025-10-06 06:42:14'
        }
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('user_roles', {
      id: [1, 2]
    });
  }
};
