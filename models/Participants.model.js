module.exports = (sequelize, DataTypes) => {
  const Participant = sequelize.define(
    "Participant", // ✅ Capitalized model name
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
      customer_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      invoice_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
    },
    {
      tableName: "participants",
      timestamps: true,
      paranoid: false, // ✅ soft deletes
      createdAt: "createdAt",
      updatedAt: "updatedAt",
      underscored: true,
    }
  );

  // Associations

  Participant.associate = (models) => {
    Participant.belongsTo(models.Customer, { foreignKey: "customer_id", as: "customer" });
    Participant.belongsTo(models.Campaign, { foreignKey: "campaign_id", as: "campaign" });
    Participant.belongsTo(models.Invoice, { foreignKey: "invoice_id", as: "invoice" });

  };

  return Participant;
};