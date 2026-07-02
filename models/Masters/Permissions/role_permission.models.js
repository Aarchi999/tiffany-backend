module.exports = (sequelize, DataTypes) => {
  const RolePermissions = sequelize.define('role_permissions', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    role_id: { type: DataTypes.BIGINT, allowNull: false },
    permission_id: { type: DataTypes.BIGINT, allowNull: false },
    assigned_by: { type: DataTypes.BIGINT, allowNull: true }
  }, {
    timestamps: true,
    underscored: true,
  });

  RolePermissions.associate = (models) => {
    RolePermissions.belongsTo(models.roles, { foreignKey: 'role_id', as: 'role' });
    RolePermissions.belongsTo(models.permissions, { foreignKey: 'permission_id', as: 'permission' });
    RolePermissions.belongsTo(models.users, { foreignKey: 'assigned_by', as: 'assignedBy' });
  };

  return RolePermissions;
};
