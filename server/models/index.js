require('dotenv').config();
import fs from 'fs'
import path from 'path'
import Sequelize from 'Sequelize'
import dbConfig from './db.js';

const env = process.env.NODE_ENV || "development";
const config = dbConfig[env];

import changelog from './changelog'
import pages from './pages'
import users from './users'

const params = Object.assign({
  // 字段以下划线（_）来分割
  underscored: true,
  dialectOptions: {
    ssl: false
  },
  define: {
    timestamps: true,
    createdAt: 'create_at',
    updatedAt: 'update_at'
  },
  logging: false
}, config);

let sequelize

if (config.url) {
  sequelize = new Sequelize(config.url, params);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, params);
}

let db = {};

[changelog, pages, users].forEach(function(md) {
  var model = md(sequelize, Sequelize);
  db[model.name] = model;
});

Object.keys(db).forEach(function(modelName) {
  if ("associate" in db[modelName]) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
