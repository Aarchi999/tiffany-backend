module.exports = (sequelize, DataTypes) => {
  const UserRoles = sequelize.define('user_roles', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.BIGINT, allowNull: false, comment: 'User who is assigned the role' },
    role_id: { type: DataTypes.BIGINT, allowNull: false, comment: 'Role assigned to the user' },
    assigned_by: { type: DataTypes.BIGINT, allowNull: true }
  }, {
    timestamps: true,
    underscored: true,
    tableName: 'user_roles',
    indexes: [{ unique: true, fields: ['user_id', 'role_id'] }]
  });

  UserRoles.associate = (models) => {
    UserRoles.belongsTo(models.users, { foreignKey: 'user_id', as: 'user' });
    UserRoles.belongsTo(models.roles, { foreignKey: 'role_id', as: 'role' });
    UserRoles.belongsTo(models.users, { foreignKey: 'assigned_by', as: 'assignedBy' });
  };

  return UserRoles;
};
