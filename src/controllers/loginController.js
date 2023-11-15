import { selectAll } from '../models/userModel';
import { selectUserById, insertNewUser } from '../models/gameModel';

export function login(req, res) {
  const { username, email } = req.body;

  const callback = (error, results, fields) => {
    if (error) console.error('Error login', error);
    else {
      const user = results.filter((f) => f.username == username && f.email == email);
      if (!user) res.status(404).json({ message: 'Username or Email not matched' });
      else {
        selectUserById(user.user_id, (error, results, fields) => {
          if (error) console.error('Error selectUserById', error);
          else {
            if (results.length == 0) {
              insertNewUser(user.user_id, (error, results, fields) => {
                if (error) console.error('Error insertNewUser', error);
                else {
                }
              });
              res.locals = { userId: user.user_id, new: true };
            } else {
              res.status(200).json({ message: `Welcome ${results.name}` });
              res.locals = { userId: user.user_id, new: false };
            }
          }
        });
      }
    }
  };
  selectAll(callback);
}

if (res.locals.new) {
}
