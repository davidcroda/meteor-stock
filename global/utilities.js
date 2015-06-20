Utilities = {};

Utilities.profileName = function(user) {

  if(user.profile.name) {
    return user.profile.name;
  } else if (user.username) {
    return user.username;
  } else if (user.emails) {
    return user.emails[0].address;
  }

  return "Who are you?";
};