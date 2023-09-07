/* eslint-disable object-curly-newline */
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class FilesController {
  static async postUpload(request, response) {
    const token = request.headers['x-token'];
    if (!token) {
      response.status(404);
      response.json({ error: 'Token missing in header' });
      return;
    }

    const res = await redisClient.get(`auth_${token}`);

    if (!res) {
      response.status(404);
      response.json({ error: 'Unauthorized' });
      return;
    }

    try {
      const user = await dbClient.getUserById(res);
      response.status(200);
      response.json(user);
    } catch (err) {
      response.status(404);
      response.json({ error: err.message });
    }

    const { name, type, data, isPublic, parentId } = request.body;
    console.log(name, type, data, isPublic, parentId);
    if (!name) {
      response.status(400);
      response.json({ error: 'Missinf name' });
      return;
    }

    if (!type) {
      response.status(400);
      response.json({ error: 'Missinf type' });
      return;
    }

    if (!data || data !== 'file') {
      response.status(400);
      response.json({ error: 'Missinf type' });
      return;
    }

    if (parentId) {
      // if no file is present in DB for this parentId, return an error Parent not found with a status code 400
      // If the file present in DB for this parentId is not of type folder, return an error Parent is not a folder with a status code 400
    }
  }
}

module.exports = FilesController;
