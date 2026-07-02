'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'roles',
      [
        {
          id: 1,
          name: 'developer_admin',
          description:
            'Developer Admin role with full access and control over the system, including restaurant & user management, role assignments, configurations, and monitoring.',
          status: '1',
          created_by: 1,
          updated_by: 1,
          created_at: '2025-09-02 07:20:26',
          updated_at: '2025-10-15 11:01:11'
        },
        {
          id: 2,
          name: 'super_admin',
          description: 'Role For Super Admin',
          status: '1',
          created_by: 1,
          updated_by: 1,
          created_at: '2025-09-02 07:21:45',
          updated_at: '2025-12-18 11:25:42'
        }
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('roles', {
      id: [1, 2]
    });
  }
};
