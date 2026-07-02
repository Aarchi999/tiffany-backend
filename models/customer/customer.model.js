module.exports = (sequelize, DataTypes) => {
  const Customer = sequelize.define(
    "Customer", // model name, capitalized
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      // campaign_id: {
      //   type: DataTypes.INTEGER,
      //   allowNull: true,
      // },
      first_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      last_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      mobile: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      invoice_file: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "customers",
      timestamps: true,      // enable createdAt / updatedAt
      paranoid: false,        // enable soft delete using deleted_at
      // deletedAt: "deleted_at",
    }
  );

  // Associations
  Customer.associate = (models) => {
    // must match exact model names from index.js
    Customer.hasMany(models.Invoice, { 
      foreignKey: "customer_id", 
      as: "invoices" 
    });

    Customer.hasMany(models.Participant, { 
      foreignKey: "customer_id", 
      as: "participants" 
    });
  };

  return Customer;
};