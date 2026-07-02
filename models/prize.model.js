// module.exports = (sequelize, DataTypes) => {
//   const Prize = sequelize.define(
//     "prizes",
//     {
//       id: {
//         type: DataTypes.BIGINT.UNSIGNED,
//         primaryKey: true,
//         autoIncrement: true,
//       },

//       campaign_id: {
//         type: DataTypes.BIGINT.UNSIGNED,
//         allowNull: false,
//       },

//       name: {
//         type: DataTypes.STRING,
//         allowNull: false,
//       },

//         total_quantity: {
//         type: DataTypes.INTEGER,
//         defaultValue: 0,
//       },

//       created_at: DataTypes.DATE,
//       updated_at: DataTypes.DATE,
//     },
//     {
//       timestamps: false,
//       tableName: "prizes",
//     }
//   );

// // 🔥 ASSOCIATION
//   Prize.associate = (models) => {

//     Prize.belongsTo(models.campaigns, {
//       foreignKey: "campaign_id",
//       as: "campaign",
//     });
//     Prize.hasMany(models.prize_allocations, {
//       foreignKey: "prize_id",
//       as: "prize_allocations"
//     });
//   };
  
  
//   return Prize;
// };

// models/prize.model.js
module.exports = (sequelize, DataTypes) => {
  const Prize = sequelize.define(
    "Prize", // ✅ Capitalized model name
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      campaign_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      total_quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      created_by: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      updated_by: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      deleted_by: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "prizes",
      timestamps: true,      // ✅ Enable timestamps
      paranoid: true,        // ✅ Enable soft deletes
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
      underscored: true,     // ✅ maps camelCase → snake_case
    }
  );

  // 🔥 Associations
  Prize.associate = (models) => {
    Prize.belongsTo(models.Campaign, { // ✅ Capitalized
      foreignKey: "campaign_id",
      as: "campaign",
    });

    Prize.hasMany(models.PrizeAllocation, { // ✅ Capitalized
      foreignKey: "prize_id",
      as: "prize_allocations",
    });
  };

  return Prize;
};