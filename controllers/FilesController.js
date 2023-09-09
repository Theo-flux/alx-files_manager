/* eslint-disable object-curly-newline */
import { v4 as uuid4 } from 'uuid';
import fs from 'fs/promises';
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

    let user = { id: '', email: '' };

    try {
      user = await dbClient.getUserById(res);
    } catch (err) {
      response.status(400);
      response.json({ error: err.message });
    }

    const acceptedTypes = ['file', 'folder', 'image'];
    const { name, type, data, isPublic, parentId } = request.body;

    let myIsPublic = isPublic;
    let myParentId = parentId;

    if (!name) {
      response.status(400);
      response.json({ error: 'Missing name' });
      return;
    }

    if (!type || !acceptedTypes.includes(type)) {
      response.status(400);
      response.json({ error: 'Missing type' });
      return;
    }

    if (!data && type !== 'folder') {
      response.status(400);
      response.json({ error: 'Missing data' });
      return;
    }

    if (myParentId) {
      try {
        await dbClient.getFileByParentId(myParentId, user.id);
      } catch (error) {
        response.status(400);
        response.json({ error: error.message });
        return;
      }
    } else {
      myParentId = 0;
    }

    if (!myIsPublic) {
      myIsPublic = false;
    }

    if (type === 'folder') {
      try {
        const res = await dbClient.createFolder(
          user.id,
          name,
          type,
          myIsPublic,
          myParentId,
        );
        response.status(201);
        response.json(res);
        return;
      } catch (error) {
        response.status(400);
        response.json({ error: error.message });
      }
    } else {
      // store in a folder path

      // get folder path env variable
      const relativePath = process.env.FOLDER_PATH || '/tmp/files_manager';
      const localPath = `${relativePath}/${uuid4()}`;
      const binaryData = Buffer.from(data, 'base64');

      try {
        try {
          await fs.mkdir(relativePath);
        } catch (error) {
          console.log(error.message);
        }
        await fs.writeFile(localPath, binaryData, 'utf-8');
      } catch (error) {
        console.log(error);
      }

      try {
        const res = await dbClient.createFileOrImage(
          user.id,
          name,
          type,
          myIsPublic,
          myParentId,
          localPath,
        );
        response.status(201);
        response.json(res);
      } catch (error) {
        response.status(400);
        response.json({ error: error.message });
      }
    }
  }
}

module.exports = FilesController;
