const sidebarMenuConfig = [
  {
    title: 'Dashboard',
    iconStyle: "bi bi-grid",
    to: 'dashboard',
    required_permission: null, // Dashboard doesn’t need permission
  },

  {
    title: 'Master',
    iconStyle: "bi-layers",
    classsChange: "mm-collapse",

    content: [
      {
        title: 'Restaurant Type', to: 'restaurant-type',
        required_permission: "view-sidebar-restaurant-type-master"
      },
      {
        title: 'Cuisine Category', to: 'cuisine-category',
        required_permission: "view-sidebar-cuisine-category"
      },
      {
        title: 'Country', to: 'country',
        required_permission: "view-sidebar-country"
      },
      {
        title: 'Province', to: 'province',
        required_permission: "view-sidebar-province"
      },
      {
        title: 'City', to: 'city',
        required_permission: "view-sidebar-city"
      },
      {
        title: 'Bank', to: 'bank',
        required_permission: "view-sidebar-bank"
      },
      {
        title: 'Document Group', to: 'document-group',
        required_permission: "view-sidebar-document-group"
      },
      {
        title: 'Document Type', to: 'document-type',
        required_permission: "view-sidebar-document-type"
      },
      {
        title: 'Menu Category', to: 'menu-category',
        required_permission: "view-sidebar-menu-category"
      },
      {
        title: 'Offer Master', to: 'offer-master',
        required_permission: "view-sidebar-offer-master"
      },
    ],
  },

  {
    title: 'Restaurant',
    iconStyle: "bi bi-shop-window",
    classsChange: "mm-collapse",

    content: [
      {
        title: 'Add Restaurant', to: 'add-restaurant',
        // required_permission: "add-sidebar-restaurant"
        required_permission: "add-restaurant"
      },
      {
        title: 'Request List', to: 'request-list',
        // required_permission: "view-sidebar-request-list"
        required_permission: "view-restaurant"
      },
      {
        title: 'Restaurant List', to: 'restaurant-list',
        // required_permission: "view-sidebar-restaurant"
        required_permission: "view-restaurant"
      },
    ],
  },

  {
    title: 'Store',
    iconStyle: "bi bi-shop",
    classsChange: "mm-collapse",

    content: [
      {
        title: 'Add Store', to: 'add-store',
        // required_permission: "add-sidebar-store"
        required_permission: "add-store"
      },
      {
        title: 'Menu', to: 'store-menu',
        required_permission: "view-sidebar-store-menu"
        // required_permission: "view-menu"
      },
      {
        title: 'Store List', to: 'store-list',
        // required_permission: "view-sidebar-store"
        required_permission: "view-store"
      },
    ],
  },

  {
    title: 'Menu',
    iconStyle: "bi bi-book",
    classsChange: "mm-collapse",
    to: 'menu-overview',
    required_permission: "view-sidebar-menu-overview"
  },

  {
    title: 'Offers',
    iconStyle: "bi-tags",
    classsChange: "mm-collapse",
    to: 'offers',
    required_permission: "view-sidebar-offer"
  },

  {
    title: 'Campaigns',
    iconStyle: "bi bi-megaphone",
    classsChange: "mm-collapse",
    to: 'campaign',
    // required_permission: null
    required_permission: "view-sidebar-offer"
  },

  {
    title: 'Permission Setting',
    iconStyle: "bi bi-gear",
    classsChange: "mm-collapse",
    content: [
      {
        title: 'Modules', to: 'module',
        required_permission: "view-sidebar-module"
      },
      {
        title: 'Roles', to: 'role',
        required_permission: "view-sidebar-role"
      },
      {
        title: 'Permissions', to: 'permission',
        required_permission: "view-sidebar-permission"
      },
      // {
      //   title: 'Users', to: 'users',
      //   required_permission: "view-sidebar-user"
      // },
    ],
  },

  {
    title: 'Users',
    iconStyle: "bi bi-person",
    classsChange: "mm-collapse",
    to: 'users',
    // required_permission: null
    required_permission: "view-sidebar-user"
  },
];

module.exports = sidebarMenuConfig;


