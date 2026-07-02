module.exports = (sequelize, DataTypes) => {
  const Invoice = sequelize.define(
    "Invoice", // ✅ Capitalized model name
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      customer_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      invoice_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      invoice_file: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "invoice_file_path", // maps model attribute to DB column 
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
     
    },
    {
      tableName: "invoices",  // ✅ matches DB table
      timestamps: true,        // uses created_at & updated_at
      paranoid: false,          // uses deleted_at
      createdAt: "created_at",
      updatedAt: "updated_at",
      underscored: true,
    }
  );

  // Associations
  Invoice.associate = (models) => {
    // Must match the capitalized model names in db/index.js
    Invoice.belongsTo(models.Customer, {
      foreignKey: "customer_id",
      as: "customer",
    });

    Invoice.hasOne(models.Coupon, {
      foreignKey: "invoice_id",
      as: "coupon",
    });

    Invoice.hasOne(models.Participant, { foreignKey: "invoice_id", as: "participant" });
  };

  return Invoice;
};