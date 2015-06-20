Config = {};

Config.INITIAL_SHARES = 100;
Config.INITIAL_MONEY = 1000;

Config.PROJECT_NAME = "Meteor Stock";

Config.ROLE_USER = "USER";
Config.ROLE_ADMIN = "ADMIN";

Accounts.config({
  forbidClientAccountCreation: false
});