'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    await queryInterface.bulkInsert(
      'modules',
      [
        {
          id: 1,
          module_name: 'users',
          level: 3,
          created_by: 1,
          updated_by: 1,
          deleted_by: null,
          deleted_at: null,
          created_at: now,
          updated_at: now
        },
        {
          id: 2,
          module_name: 'roles',
          level: 1,
          created_by: 1,
          updated_by: null,
          deleted_by: null,
          deleted_at: null,
          created_at: now,
          updated_at: now
        },
        {
          id: 3,
          module_name: 'permissions',
          level: 1,
          created_by: 1,
          updated_by: null,
          deleted_by: null,
          deleted_at: null,
          created_at: now,
          updated_at: now
        }
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('modules', { id: [1, 2, 3] }, {});
  }
};
