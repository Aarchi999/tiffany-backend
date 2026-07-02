module.exports = (sequelize, DataTypes) => {
  const UserDevices = sequelize.define('user_devices', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    device_type: {
      type: DataTypes.ENUM('desktop', 'mobile'),
      allowNull: false,
    },
    device_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    os_type: {
      type: DataTypes.ENUM('ios', 'android', 'web'),
      allowNull: false,
    },
    token: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    token_expires_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    fcm_token: {
      type: DataTypes.STRING(512),
      allowNull: true,
    },
    last_login_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('0', '1'), // 0 = inactive, 1 = active
      allowNull: false,
      defaultValue: '1',
    },
    deleted_at: { type: DataTypes.DATE, allowNull: true }
  }, {
    timestamps: true, // created_at, updated_at
    underscored: true,
    paranoid: true
  });

  UserDevices.associate = (models) => {
    // Reference to Users table
    UserDevices.belongsTo(models.users, { foreignKey: 'user_id', as: 'user' });
  };

  return UserDevices;
};
