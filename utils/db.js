/* eslint-disable consistent-return */
import sha1 from 'sha1';
import MongoClient from 'mongodb/lib/mongo_client';
import { ObjectId } from 'mongodb';

class DBClient {
  constructor() {
    this.host = process.env.DB_HOST || 'localhost';
    this.port = process.env.DB_PORT || 27017;
    this.database = process.env.DB_DATABASE || 'files_manager';

    const uri = `mongodb://${this.host}:${this.port}/${this.database}`;
    this.client = new MongoClient(uri);
    this.client.connect((err) => {
      if (err) {
        console.error('Error connecting to MongoDB:', err);
      } else {
        console.log('Connected to MongoDB');
      }
    });
  }

  isAlive() {
    return !!this.client && this.client.isConnected();
  }

  async nbUsers() {
    if (!this.isAlive()) return 0;
    const usersCollection = this.client.db().collection('users');
    return usersCollection.countDocuments();
  }

  async nbFiles() {
    if (!this.isAlive()) return 0;
    const filesCollection = this.client.db().collection('files');
    return filesCollection.countDocuments();
  }

  async registerUser(email, password) {
    if (!this.isAlive()) return 0;

    const usersCollection = this.client.db().collection('users');
    try {
      // Check if the email already exists
      const existingUser = await usersCollection.findOne({ email });

      if (existingUser) {
        throw new Error('Already exist');
      }

      // Insert the new user into the users collection
      const result = await usersCollection.insertOne({
        email,
        password: sha1(password),
      });

      if (result.insertedCount === 1) {
        return result.insertedId;
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getUser(email, password) {
    if (!this.isAlive()) return 0;
    const usersCollection = this.client.db().collection('users');

    try {
      // Check if the email exists
      const existingUser = await usersCollection.findOne({ email, password });
      return existingUser;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getUserById(_id) {
    if (!this.isAlive()) return 0;
    const usersCollection = this.client.db().collection('users');

    try {
      const user = await usersCollection.findOne({ _id: ObjectId(_id) });
      if (user) {
        return { id: user._id, email: user.email };
      }
      throw new Error('Unauthorized');
    } catch (error) {
      // Handle any errors that occur during the database operation
      console.error(error);
      throw error;
    }
  }
}

const dbClient = new DBClient();

module.exports = dbClient;
