import dbClient from '../utils/db';

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
      response.status(200);
      response.json({ id: data, email });
    } catch (error) {
      response.status(400);
      response.json({ error: error.message });
    }
  }

  static getMe(request, response) {}
}

module.exports = UsersController;
