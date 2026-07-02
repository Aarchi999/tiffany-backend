// module.exports = (sequelize, DataTypes) => {
//   const User = sequelize.define('User', {
//     id: {
//       type: DataTypes.BIGINT.UNSIGNED,
//       primaryKey: true,
//       autoIncrement: true
//     },
//     // api_token: {
//     //   type: DataTypes.STRING
//     // },
//     // username: {
//     //   type: DataTypes.STRING,
//     //   allowNull: false
//     // },
//     name: {
//       type: DataTypes.STRING,
//       allowNull: false
//     },
//     avatar: {
//       type: DataTypes.TEXT
//     },
//     email: {
//       type: DataTypes.STRING
//     },
//     phone: {
//       type: DataTypes.STRING
//     },
//     password: {
//       type: DataTypes.STRING,
//       allowNull: false
//     },
//     status: {
//       type: DataTypes.ENUM('1', '0'),
//       defaultValue: '0'
//     },
//     is_admin_user: {
//       type: DataTypes.ENUM('1', '0'),
//       defaultValue: '0'
//     },
//     remember_token: {
//       type: DataTypes.STRING
//     },
//     created_by: {
//       type: DataTypes.INTEGER,
//       defaultValue: 1
//     },
//     updated_by: {
//       type: DataTypes.INTEGER
//     },
//     deleted_by: {
//       type: DataTypes.INTEGER
//     }
//   }, {
//     tableName: 'users',
//     timestamps: false
//   });

//   return User;
// };


module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },

    name: {
      type: DataTypes.STRING
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false
    },

    password_hash: {
      type: DataTypes.STRING
    },

    is_active: {
      type: DataTypes.ENUM('1', '0'),
      defaultValue: '1'
    },

    otp_code: {
      type: DataTypes.STRING
    },

    otp_expires_at: {
      type: DataTypes.DATE
    },

    failed_login_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },

    created_at: {
      type: DataTypes.DATE
    },

    updated_at: {
      type: DataTypes.DATE
    },

    deleted_at: {
      type: DataTypes.DATE
    }

  }, {
    tableName: 'users',
    timestamps: false
  });

  return User;
};