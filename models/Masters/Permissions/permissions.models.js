module.exports = (sequelize, DataTypes) => {
  const Permissions = sequelize.define('permissions', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    module_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'modules',
        key: 'id',
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('1', '0'),
      allowNull: false,
      defaultValue: '1', // 1=active, 0=inactive
    },
    created_by: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    updated_by: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    deleted_by: {
      type: DataTypes.BIGINT,
      allowNull: true,
    }
  }, {
    timestamps: true,       // createdAt, updatedAt
    paranoid: true,         // deletedAt
    underscored: true,
  });

  Permissions.associate = (models) => {

    // Users relation
    Permissions.belongsTo(models.users, { foreignKey: 'created_by', as: 'creator' });
    Permissions.belongsTo(models.users, { foreignKey: 'updated_by', as: 'updater' });
    Permissions.belongsTo(models.users, { foreignKey: 'deleted_by', as: 'deleter' });

    // Module relation
    Permissions.belongsTo(models.modules, { foreignKey: 'module_id', as: 'module' });

    // Role permission relation
    Permissions.hasMany(models.role_permissions, { foreignKey: 'permission_id', as: 'rolePermissions' });

    // User permission raltion
    Permissions.hasMany(models.user_permissions, { foreignKey: 'permission_id', as: 'userPermissions' });

  };

  return Permissions;
};
