module.exports = (sequelize, DataTypes) => {
  const Roles = sequelize.define('roles', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    description: { type: DataTypes.STRING },
    status: { type: DataTypes.ENUM('1', '0'), allowNull: false, defaultValue: '1' },
    created_by: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 1 },
    updated_by: { type: DataTypes.BIGINT },
    deleted_by: { type: DataTypes.BIGINT },
    deleted_at: { type: DataTypes.DATE }
  }, {
    timestamps: true,
    underscored: true,
    paranoid: true,
    tableName: 'roles'
  });

  Roles.associate = (models) => {

    // users realation
    Roles.belongsTo(models.users, { foreignKey: 'created_by', as: 'creator' });
    Roles.belongsTo(models.users, { foreignKey: 'updated_by', as: 'updater' });
    Roles.belongsTo(models.users, { foreignKey: 'deleted_by', as: 'deleter' });

    // Roles Permission realtaion
    Roles.hasMany(models.role_permissions, { foreignKey: 'role_id', as: 'rolePermissions' });

    // User Roles realations
    Roles.hasMany(models.user_roles, { foreignKey: 'role_id', as: 'userRoles' });

  };

  return Roles;
};
