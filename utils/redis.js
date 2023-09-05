/* eslint-disable class-methods-use-this */
import { createClient } from 'redis';

class RedisClient {
  constructor() {
    this.client = createClient();

    this.client.on('error', (err) => {
      console.log(`Redis not connected to server: ${err}`);
    });
  }

  isAlive() {
    return true;
  }

  async get(key) {
    return new Promise((resolve, reject) => {
      this.client.get(key, (error, data) => {
        if (error) {
          reject(error);
        } else {
          resolve(data);
        }
      });
    });
  }

  async set(key, value, duration) {
    return new Promise((resolve, reject) => {
      this.client.setex(key, duration, value, (error, data) => {
        if (error) {
          reject(error);
        } else {
          resolve(data);
        }
      });
    });
  }

  async del(key) {
    return new Promise((resolve, reject) => {
      this.client.del(key, (error, data) => {
        if (error) {
          reject(error);
        } else {
          resolve(data === 1);
        }
      });
    });
  }
}

// eslint-disable-next-line import/prefer-default-export
export const redisClient = new RedisClient();
