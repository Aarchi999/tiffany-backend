// module.exports = (sequelize, DataTypes) => {
//   const PrizeAllocation = sequelize.define(
//     "prize_allocations",
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

//       prize_id: {
//         type: DataTypes.BIGINT.UNSIGNED,
//         allowNull: false,
//       },

//       quantity: DataTypes.INTEGER,
//       winner_quantity: DataTypes.INTEGER,
//     },
//     {
//       timestamps: false,
//       tableName: "prize_allocations",
//     }
//   );

//   PrizeAllocation.associate = (models) => {
//     PrizeAllocation.belongsTo(models.campaigns, {
//       foreignKey: "campaign_id",
//     });

//     PrizeAllocation.belongsTo(models.prizes, {
//       foreignKey: "prize_id",
//       as:"prize"
//     });
//   };

//   return PrizeAllocation;
// };

// models/prize_allocation.model.js
module.exports = (sequelize, DataTypes) => {
  const PrizeAllocation = sequelize.define(
    "PrizeAllocation", // ✅ Capitalized
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
      prize_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      // winner_quantity: {
      //   type: DataTypes.INTEGER,
      //   allowNull: true,
      //   defaultValue: 0,
      // },
      // created_by: {
      //   type: DataTypes.BIGINT,
      //   allowNull: true,
      // },
      // updated_by: {
      //   type: DataTypes.BIGINT,
      //   allowNull: true,
      // },
      // deleted_by: {
      //   type: DataTypes.BIGINT,
      //   allowNull: true,
      // },
      // created_at: {
      //   type: DataTypes.DATE,
      //   allowNull: true,
      //   defaultValue: DataTypes.NOW,
      // },
      // updated_at: {
      //   type: DataTypes.DATE,
      //   allowNull: true,
      //   defaultValue: DataTypes.NOW,
      // },
      // deleted_at: {
      //   type: DataTypes.DATE,
      //   allowNull: true,
      // },
    },
    {
      tableName: "prize_allocations",
      timestamps: false,      // ✅ Enable timestamps
      paranoid: false,        // ✅ Enable soft deletes
      // createdAt: "created_at",
      // updatedAt: "updated_at",
      // deletedAt: "deleted_at",
      underscored: true,     // ✅ map camelCase → snake_case
    }
  );

  PrizeAllocation.associate = (models) => {
    PrizeAllocation.belongsTo(models.Campaign, { // ✅ Capitalized
      foreignKey: "campaign_id",
      as: "campaign",
    });

    PrizeAllocation.belongsTo(models.Prize, { // ✅ Capitalized
      foreignKey: "prize_id",
      as: "prize",
    });
  };

  return PrizeAllocation;
};