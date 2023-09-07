import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class UsersController {
  static async postNew(request, response) {
    const { email, password } = request.body;

    if (!email) {
      response.status(400);
      response.json({ error: 'Missing email' });
      return;
    }

    if (!password) {
      response.status(400);
      response.json({ error: 'Missing password' });
      return;
    }

    try {
      const data = await dbClient.registerUser(email, password);
      response.status(201);
      response.json({ id: data, email });
    } catch (error) {
      response.status(400);
      response.json({ error: error.message });
    }
  }

  static async getMe(request, response) {
    const token = request.headers['x-token'];
    if (!token) {
      response.status(404);
      response.json({ error: 'Token missing in header' });
      return;
    }

    const res = await redisClient.get(`auth_${token}`);

    if (!res) {
      response.status(401);
      response.json({ error: 'Unauthorized' });
      return;
    }

    try {
      const user = await dbClient.getUserById(res);
      response.status(200);
      response.json(user);
    } catch (err) {
      response.status(401);
      response.json({ error: err.message });
    }
  }
}

module.exports = UsersController;
