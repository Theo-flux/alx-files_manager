import sha1 from 'sha1';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class AuthController {
  static async getConnect(request, response) {
    const authHeader = request.headers.authorization;

    if (!authHeader) throw new Error('Authorization header missing');
    if (authHeader.split(' ')[0] !== 'Basic') {
      throw new Error('Basic authorization header missing');
    }
    const encoded = authHeader.split(' ')[1];
    const decoded = Buffer.from(encoded, 'base64').toString();

    if (!decoded.includes(':')) throw new Error('invalid auhtorization format');
    const email = decoded.split(':')[0];
    const password = decoded.split(':')[1];

    try {
      const user = await dbClient.getUser(email, sha1(password));

      if (!user) {
        response.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // generate token
      const token = uuidv4();
      const key = `auth_${token}`;

      // store the token in redis
      await redisClient.set(key, token, 24 * 60 * 60);
      // console.log(user, key);

      const val = await redisClient.get(key);
      response.status(200).json({ token: val });
    } catch (err) {
      console.log(err);
    }

    // console.log(email, password);
  }

  static getDisconnect(request, response) {}
}

module.exports = AuthController;
