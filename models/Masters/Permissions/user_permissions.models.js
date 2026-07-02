module.exports = (sequelize, DataTypes) => {
  const UserPermissions = sequelize.define('user_permissions', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.BIGINT, allowNull: false },
    permission_id: { type: DataTypes.BIGINT, allowNull: false },
    assigned_by: { type: DataTypes.BIGINT, allowNull: true }
  }, {
    timestamps: true,
    underscored: true,
  });

  UserPermissions.associate = (models) => {
    // Permissions realtion
    UserPermissions.belongsTo(models.permissions, { foreignKey: 'permission_id', as: 'permission' });

    // Users realtion
    UserPermissions.belongsTo(models.users, { foreignKey: 'user_id', as: 'user' });
    UserPermissions.belongsTo(models.users, { foreignKey: 'assigned_by', as: 'assignedBy' });

  };

  return UserPermissions;
};
