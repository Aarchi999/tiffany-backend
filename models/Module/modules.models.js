module.exports = (sequelize, DataTypes) => { //sequelize → database connection
                                            //DataTypes → column types (STRING, BIGINT, etc.)

  const Modules = sequelize.define('modules', {  //modules → database table ka naam
    id: {                                        //Modules → JS model ka naam
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    module_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    level: {
      type: DataTypes.ENUM('1', '2', '3'),
      allowNull: false,
      defaultValue: '1'
    },
    created_by: {  //Kis user ne module banaya
      type: DataTypes.BIGINT,
      defaultValue: 1
    },
    updated_by: { //Last update kisne kiya
      type: DataTypes.BIGINT
    },
    deleted_by: { //Kis user ne delete kiya
      type: DataTypes.BIGINT
    },
    deleted_at: { //Kab delete hua
      type: DataTypes.DATE
    }
  }, {
    timestamps: true,          // adds created_at and updated_at
    underscored: true,         // snake_case columns
    paranoid: true             // enables soft delete via deleted_at
  });

  // ✅ Associations (optional)
  Modules.associate = (models) => {   //Ye function models ke beech relations define karta hai

    // Permissions relation
    Modules.hasMany(models.permissions, { foreignKey: 'module_id', as: 'permissions' }); //Ek module ke multiple permissions ho sakte hain

    Modules.belongsTo(models.users, { foreignKey: 'created_by', as: 'creator' });
    Modules.belongsTo(models.users, { foreignKey: 'updated_by', as: 'updater' });
    Modules.belongsTo(models.users, { foreignKey: 'deleted_by', as: 'deleter' });
  };

  return Modules;   
};
