
module.exports = (sequelize, DataTypes) => {
  const Coupon = sequelize.define(
    "Coupon", // model name, capitalized
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
          allowNull: false,
      },
      invoice_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false
      },
      coupon_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true, // optional: ensure coupon codes are unique
      },
      is_used: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0
      },
      is_winner: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0
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
      tableName: "coupons", // matches your DB table
      timestamps: true,     // uses created_at & updated_at
      paranoid: false, // soft delete disabled
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at", 
    }
  );

  // Associations
Coupon.associate = (models) => {
  Coupon.belongsTo(models.Invoice, { foreignKey: "invoice_id", as: "invoice" });
  Coupon.hasOne(models.Winner, { foreignKey: "coupon_id", as: "winner" });
};
  return Coupon;
};