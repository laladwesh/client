import AdminJS from 'adminjs';
// Use dynamic imports with top-level await to handle packages that may expose
// named or default exports depending on build format.
const AdminJSExpressModule = await import('@adminjs/express');
const AdminJSMongooseModule = await import('@adminjs/mongoose');

const AdminJSExpress = AdminJSExpressModule.default ?? AdminJSExpressModule;
const AdminJSMongoose = AdminJSMongooseModule.default ?? AdminJSMongooseModule;

import User from './models/User.js';
import Product from './models/Product.js';
import Blog from './models/Blog.js';
import Order from './models/Order.js';

// @adminjs/mongoose may export a namespace or a default adapter depending on package build.
const mongooseAdapter = AdminJSMongoose.MongooseAdapter ?? AdminJSMongoose.default ?? AdminJSMongoose;
AdminJS.registerAdapter(mongooseAdapter);

const adminOptions = {
  resources: [
    {
      resource: User,
      options: {
        properties: {
          googleId: { isVisible: { list: false, filter: false, show: false, edit: false } },
          __v: { isVisible: false }
        },
        listProperties: ['_id', 'name', 'email', 'role', 'createdAt']
      }
    },
    { resource: Product },
    { resource: Blog },
    { resource: Order }
  ],
  // AdminJS assets must be served under '/admin' because the router is mounted at '/admin'
  rootPath: '/admin',
  branding: {
    companyName: 'NuFab Admin'
  }
};

const admin = new AdminJS(adminOptions);

// Build a router; actual path will be protected by JWT middleware in server.js
const buildRouter = AdminJSExpress.buildRouter ?? AdminJSExpress.default?.buildRouter ?? AdminJSExpress.buildAuthenticatedRouter;
if (!buildRouter) {
  throw new Error('Could not find AdminJS Express router builder in @adminjs/express');
}
const router = buildRouter(admin);

export default router;
