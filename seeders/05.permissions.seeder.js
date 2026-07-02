'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    await queryInterface.bulkInsert(
      'permissions',
      [
        // ===== MODULE 1 => users =====
        {
          id: 1,
          module_id: 1,
          name: 'Add User',
          slug: 'add-user',
          description: 'Can Add User',
          status: '1',
          created_by: 1,
          updated_by: null,
          deleted_by: null,
          created_at: now,
          updated_at: now,
          deleted_at: null
        },
        {
          id: 2,
          module_id: 1,
          name: 'View User',
          slug: 'view-user',
          description: 'Can View User',
          status: '1',
          created_by: 1,
          updated_by: 1,
          deleted_by: null,
          created_at: now,
          updated_at: now,
          deleted_at: null
        },
        {
          id: 3,
          module_id: 1,
          name: 'Update User',
          slug: 'update-user',
          description: 'Can Update User',
          status: '1',
          created_by: 1,
          updated_by: null,
          deleted_by: null,
          created_at: now,
          updated_at: now,
          deleted_at: null
        },
        {
          id: 4,
          module_id: 1,
          name: 'Delete User',
          slug: 'delete-user',
          description: 'Can Delete User',
          status: '1',
          created_by: 1,
          updated_by: null,
          deleted_by: null,
          created_at: now,
          updated_at: now,
          deleted_at: null
        },
        {
          id: 5,
          module_id: 1,
          name: 'View Sidebar User',
          slug: 'view-sidebar-user',
          description: 'Permission to view user sidebar',
          status: '1',
          created_by: 1,
          updated_by: null,
          deleted_by: null,
          created_at: now,
          updated_at: now,
          deleted_at: null
        },

        // ===== MODULE 2 => roles =====
        {
          id: 6,
          module_id: 2,
          name: 'Add Role',
          slug: 'add-role',
          description: 'Can Add Role',
          status: '1',
          created_by: 1,
          updated_by: 1,
          deleted_by: null,
          created_at: now,
          updated_at: now,
          deleted_at: null
        },
        {
          id: 7,
          module_id: 2,
          name: 'View Role',
          slug: 'view-role',
          description: 'Can View Role',
          status: '1',
          created_by: 1,
          updated_by: 1,
          deleted_by: null,
          created_at: now,
          updated_at: now,
          deleted_at: null
        },
        {
          id: 8,
          module_id: 2,
          name: 'Update Role',
          slug: 'update-role',
          description: 'Can Update Role',
          status: '1',
          created_by: 1,
          updated_by: null,
          deleted_by: null,
          created_at: now,
          updated_at: now,
          deleted_at: null
        },
        {
          id: 9,
          module_id: 2,
          name: 'Delete Role',
          slug: 'delete-role',
          description: 'Can Delete Role',
          status: '1',
          created_by: 1,
          updated_by: null,
          deleted_by: null,
          created_at: now,
          updated_at: now,
          deleted_at: null
        },
        {
          id: 10,
          module_id: 2,
          name: 'View Sidebar Role',
          slug: 'view-sidebar-role',
          description: 'Permission to view role sidebar',
          status: '1',
          created_by: 1,
          updated_by: null,
          deleted_by: null,
          created_at: now,
          updated_at: now,
          deleted_at: null
        },
        {
          id: 11,
          module_id: 2,
          name: 'Assign Permissions In Role',
          slug: 'assign-permissions-in-role',
          description: 'Assign Permissions In Role',
          status: '1',
          created_by: 1,
          updated_by: null,
          deleted_by: null,
          created_at: now,
          updated_at: now,
          deleted_at: null
        },

        // ===== MODULE 3 => permissions =====
        {
          id: 12,
          module_id: 3,
          name: 'Add Permission',
          slug: 'add-permission',
          description: 'Can Add Permission',
          status: '1',
          created_by: 1,
          updated_by: null,
          deleted_by: null,
          created_at: now,
          updated_at: now,
          deleted_at: null
        },
        {
          id: 13,
          module_id: 3,
          name: 'View Permission',
          slug: 'view-permission',
          description: 'Can View Permission',
          status: '1',
          created_by: 1,
          updated_by: null,
          deleted_by: null,
          created_at: now,
          updated_at: now,
          deleted_at: null
        },
        {
          id: 14,
          module_id: 3,
          name: 'Update Permission',
          slug: 'update-permission',
          description: 'Can Update Permission',
          status: '1',
          created_by: 1,
          updated_by: null,
          deleted_by: null,
          created_at: now,
          updated_at: now,
          deleted_at: null
        },
        {
          id: 15,
          module_id: 3,
          name: 'Delete Permission',
          slug: 'delete-permission',
          description: 'Can Delete Permission',
          status: '1',
          created_by: 1,
          updated_by: null,
          deleted_by: null,
          created_at: now,
          updated_at: now,
          deleted_at: null
        },
        {
          id: 16,
          module_id: 3,
          name: 'View Sidebar Permission',
          slug: 'view-sidebar-permission',
          description: 'Permission to view permission sidebar',
          status: '1',
          created_by: 1,
          updated_by: null,
          deleted_by: null,
          created_at: now,
          updated_at: now,
          deleted_at: null
        }
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      'permissions',
      { id: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16] },
      {}
    );
  }
};
