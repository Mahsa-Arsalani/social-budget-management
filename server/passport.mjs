import passport from "passport";
import LocalStrategy from "passport-local"
import dao from "./dao-users.mjs"

passport.use(
    new LocalStrategy(async (username, password, callback) => {
      try {
        const user = await dao.getUserByCredentials(username, password);
        if (!user) {
          return callback(null, false, {
            message: "Incorrect username or password",
          });
        }
  
        return callback(null, user);
      } catch (error) {
        return callback(error);
      }
    })
  );
  
  passport.serializeUser(function (user, callback) {
    return callback(null, user);
  });
  
  passport.deserializeUser(function (user, callback) {
    return callback(null, user);
  });
  
  export default passport;
  