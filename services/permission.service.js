const { users, user_permissions, user_roles, role_permissions, permissions, roles } = require('../models');

const getUserPermissions = async (userId) => {
  const user = await users.findByPk(userId, {
    include: [
      { model: user_permissions, as: 'userPermissions', include: [{ model: permissions, as: 'permission' }] },
      {
        model: user_roles,
        as: 'userRoles',
        include: [
          {
            model: roles,
            as: 'role',
            include: [{ model: role_permissions, as: 'rolePermissions', include: [{ model: permissions, as: 'permission', attributes: ['id', 'name', 'slug'] }] }]
          }
        ]
      }
    ]
  });


  if (!user) return [];
  // 1️⃣ If user has explicit permissions → use those
  const userPerms = user?.userPermissions.map(up => up.permission.slug);

  if (userPerms.length > 0) return userPerms;

  // 2️⃣ Else fallback to role permissions
  let rolePerms = [];
  user.userRoles.forEach(ur => {
    ur.role.rolePermissions.forEach(rp => {
      if (rp.permission && rp.permission.slug) rolePerms.push(rp.permission.slug);
    });
  });

  rolePerms = [...new Set(rolePerms)];

  return rolePerms;

};

module.exports = { getUserPermissions };
