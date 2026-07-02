module.exports = (sequelize, DataTypes) => {
  const Winner = sequelize.define(
    "Winner", // Capitalized model name
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
      prize_allocation_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      coupon_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true, // nullable if winner doesn't need a coupon
      },
      winner_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },

      email_sent: {
        type: DataTypes.TINYINT,
        defaultValue: 0,
      },

      email_sent_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      email_failed: {
        type: DataTypes.TINYINT,
        defaultValue: 0,
      },
      // created_by: { type: DataTypes.BIGINT, allowNull: true },
      // updated_by: { type: DataTypes.BIGINT, allowNull: true },
      // deleted_by: { type: DataTypes.BIGINT, allowNull: true },
      created_at: { type: DataTypes.DATE, allowNull: true, defaultValue: DataTypes.NOW }
      // updated_at: { type: DataTypes.DATE, allowNull: true, defaultValue: DataTypes.NOW }
      // deleted_at: { type: DataTypes.DATE, allowNull: true },

    },
    {
      tableName: "winners",
      timestamps: false,
      paranoid: false,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
    }
  );

  // Associations
  Winner.associate = (models) => {
    Winner.belongsTo(models.Prize, { foreignKey: "prize_id", as: "prize" });
    Winner.belongsTo(models.Campaign, { foreignKey: "campaign_id", as: "campaign" });
    Winner.belongsTo(models.Coupon, { foreignKey: "coupon_id", as: "coupon" });
    //  Winner.belongsTo(models.PrizeAllocation, { foreignKey: 'prize_allocation_id', as: 'prize_allocation' });
  };

  return Winner;
};