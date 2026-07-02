// models/campaign.model.js
module.exports = (sequelize, DataTypes) => {
  const Campaign = sequelize.define(
    "Campaign", // ✅ Capitalized model name
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      end_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      max_winners: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("active", "closed"),
        defaultValue: "active",
        allowNull: false,
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
      tableName: "campaigns",
      timestamps: true,       // ✅ Sequelize will use custom columns
      paranoid: true,         // ✅ Enable soft delete via deleted_at
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
      underscored: true,
    }
  );

  // 🔥 Associations
  Campaign.associate = (models) => {
    Campaign.hasMany(models.PrizeAllocation, {
      foreignKey: "campaign_id",
      as: "prize_allocations"
    });

    Campaign.hasMany(models.Participant, {
      foreignKey: "campaign_id",
      as: "participants"

    });

    Campaign.hasMany(models.Winner, {
      foreignKey: "campaign_id",
      as: "winners"
    });
  };

  return Campaign;
};