module.exports = (sequelize, DataTypes) => {
  const usersRegistration = sequelize.define('usersRegistrationRegistration', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(100) },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING(255), allowNull: true },
    is_active: {
      type: DataTypes.ENUM('1', '0'),
      allowNull: false,
      defaultValue: '1'
    },
    // token: { type: DataTypes.TEXT, allowNull: true },
    // token_expires_at: { type: DataTypes.DATE, allowNull: true },
    otp_code: DataTypes.STRING,
    otp_expires_at: DataTypes.DATE,
    failed_login_attempts: { type: DataTypes.INTEGER, defaultValue: 0 },
    deleted_at: { type: DataTypes.DATE, allowNull: true }
  }, {
    timestamps: true,
    underscored: true,
    paranoid: true
  });

  // Get Restaurant details from user id

  usersRegistration.getOwnedParentRestaurants = async function (userId, models) {
    try {
      // Step 1: Get role id for "restaurant_owner"
      const ownerRole = await models.roles.findOne({
        where: { name: "restaurant_owner" },
        attributes: ['id']
      });

      if (!ownerRole) return [];

      // Step 2: Check if this user has the restaurant_owner role
      const userRole = await models.user_roles.findOne({
        where: {
          user_id: userId,
          role_id: ownerRole.id
        }
      });

      if (!userRole) return [];

      // Step 3: Find all restaurants where this user is staff
      const staffRecords = await models.restaurant_staff.findAll({
        where: { user_id: userId },
        attributes: ['restaurant_id']
      });
      console.log("🚀 ~ staffRecords:", staffRecords)

      if (!staffRecords || staffRecords.length === 0) return [];

      const restaurantIds = staffRecords.map(r => r.restaurant_id);

      // Step 4: Get only parent restaurants (parent_id = null)
      const restaurants = await models.restaurants.findAll({
        where: {
          id: restaurantIds,
          parent_id: { [models.Sequelize.Op.is]: null }
        },
        attributes: ['id', 'restaurant_name', 'status']
      });

      return restaurants[0];
    } catch (error) {
      console.error("Error in getOwnedParentRestaurants:", error);
      throw error;
    }
  };

  // Get restaurant hierarchy for store_admin (main and store both) by  user id

  usersRegistration.getStoreAdminRestaurantHierarchy = async function (userId, models) {
    try {
      /* ---------------- GET ROLE ---------------- */

      const storeAdminRole = await models.roles.findOne({
        where: { name: "store_admin" },
        attributes: ["id"]
      });

      if (!storeAdminRole) return null;

      /* ---------------- VERIFY ROLE ---------------- */

      const userRole = await models.user_roles.findOne({
        where: {
          user_id: userId,
          role_id: storeAdminRole.id
        }
      });

      if (!userRole) return null;

      /* ---------------- GET STAFF + RESTAURANT ---------------- */

      const staff = await models.restaurant_staff.findOne({
        where: { user_id: userId },
        attributes: [],
        include: [
          {
            model: models.restaurants,
            as: "restaurant",
            attributes: ["id", "restaurant_name", "status", "parent_id"],
            include: [
              {
                model: models.restaurants,
                as: "parent", // 🔑 alias from your model
                attributes: ["id", "restaurant_name", "status"]
              }
            ]
          }
        ]
      });

      if (!staff || !staff.restaurant) return null;

      const storeRestaurant = staff.restaurant;
      const ownerRestaurant = storeRestaurant.parent;

      /* ---------------- FORMAT RESPONSE ---------------- */

      // Case: store admin mistakenly attached to HQ
      if (!ownerRestaurant) {
        return {
          id: storeRestaurant.id,
          name: storeRestaurant.restaurant_name,
          status: storeRestaurant.status,
          store: null
        };
      }

      return {
        id: ownerRestaurant.id,
        name: ownerRestaurant.restaurant_name,
        status: ownerRestaurant.status,
        store: {
          id: storeRestaurant.id,
          name: storeRestaurant.restaurant_name,
          status: storeRestaurant.status
        }
      };

    } catch (error) {
      console.error("Error in getStoreAdminRestaurantHierarchy:", error);
      throw error;
    }
  };




  usersRegistration.associate = (models) => {

    // Modules relations
    usersRegistration.hasMany(models.modules, { foreignKey: 'created_by', as: 'createdModules' });
    usersRegistration.hasMany(models.modules, { foreignKey: 'updated_by', as: 'updatedModules' });
    usersRegistration.hasMany(models.modules, { foreignKey: 'deleted_by', as: 'deletedModules' });

    // UserPermissions relations
    usersRegistration.hasMany(models.user_permissions, { foreignKey: 'user_id', as: 'userPermissions' });
    usersRegistration.hasMany(models.user_permissions, { foreignKey: 'assigned_by', as: 'userPermissionsAssignedBy' });

    // UserRoles relations
    usersRegistration.hasMany(models.user_roles, { foreignKey: 'user_id', as: 'userRoles' });
    usersRegistration.hasMany(models.user_roles, { foreignKey: 'assigned_by', as: 'userRolesAssignedBy' });

    // RolePermissions relations
    usersRegistration.hasMany(models.role_permissions, { foreignKey: 'assigned_by', as: 'rolePermissionsAssignedBy' });

    // User Device realations
    usersRegistration.hasMany(models.user_devices, { foreignKey: 'user_id', as: 'devices' });

  };

  return usersRegistration;
};
