'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // permissions id are 1 to 16
    const permissionIds = Array.from({ length: 16 }, (_, i) => i + 1);

    const roleIds = [1, 2];

    const rows = [];

    for (const roleId of roleIds) {
      for (const permissionId of permissionIds) {
        rows.push({
          role_id: roleId,
          permission_id: permissionId,
          assigned_by: 1,
          created_at: now,
          updated_at: now
        });
      }
    }

    await queryInterface.bulkInsert('role_permissions', rows, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      'role_permissions',
      { role_id: [1, 2] },
      {}
    );
  }
};
