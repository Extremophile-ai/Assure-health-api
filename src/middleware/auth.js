import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export default class Authentication {
  static async authenticate(req, res, next) {
    try {
      const { authorization } = req.headers;
      let decoded;
      if (authorization) {
        try {
          const token = req.headers.authorization.split(' ')[1];
          decoded = jwt.verify(token, process.env.JWT_KEY);
        } catch (error) {
          return res.status(410).json({ status: 410, error: 'Session expired, you have to login.' });
        }
        req.decoded = decoded;
        return next();
      }
      return res.status(401).json({ status: 401, error: 'Sorry, you have to login.' });
    } catch (error) {
      return res.status(500).json({ status: 500, error: 'Server Error' });
    }
  }
}
