import request from 'supertest';
import app from '../app';
import mongoose from 'mongoose';
import Item from '../models/item';
import redisClient from '../redisClient';

describe('My List API', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb+srv://mishrasiddharth1999:Reenter2@cluster0.drc2anz.mongodb.net/ott?retryWrites=true&w=majority&appName=Cluster0', {

  });
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
    if (redisClient.isOpen) {
      await redisClient.quit();
    }
  });

  afterEach(async () => {
    await Item.deleteMany({});
    const keys = await redisClient.keys('user:*');
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  });

  describe('POST /api/mylist', () => {
    it('should add an item to the list', async () => {
      const res = await request(app)
        .post('/api/mylist')
        .send({ userId: '1', contentId: 'm6', contentType: 'Movies' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('userId', '1');
      expect(res.body).toHaveProperty('contentId', 'm6');
      expect(res.body).toHaveProperty('contentType', 'Movies');
    });

    it('should not add a duplicate item to the list', async () => {
      await request(app)
        .post('/api/mylist')
        .send({ userId: '1', contentId: 'm6', contentType: 'Movies' });

      const res = await request(app)
        .post('/api/mylist')
        .send({ userId: '1', contentId: 'm6', contentType: 'Movies' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Item already in list');
    });
  });

  describe('DELETE /api/mylist/:userId/:contentId', () => {
    it('should remove an item from the list', async () => {
      await request(app)
        .post('/api/mylist')
        .send({ userId: '1', contentId: 'm6', contentType: 'Movies' });

      const res = await request(app)
        .delete('/api/mylist/1/m6');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Item removed');
    });

    it('should return 404 if the item is not found', async () => {
      const res = await request(app)
        .delete('/api/mylist/1/m6');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('message', 'Item not found');
    });
  });

  describe('GET /api/mylist/:userId', () => {
    it('should list items in the user\'s list', async () => {
      await request(app)
        .post('/api/mylist')
        .send({ userId: '1', contentId: 'm6', contentType: 'Movies' });

      const res = await request(app)
        .get('/api/mylist/1?page=1&limit=10');

      expect(res.status).toBe(200);
      expect(res.body.items.length).toBe(1);
      expect(res.body).toHaveProperty('totalPages', 1);
    });

    it('should return an empty list if no items are found', async () => {
      const res = await request(app)
        .get('/api/mylist/1?page=1&limit=10');

      expect(res.status).toBe(200);
      expect(res.body.items.length).toBe(0);
      expect(res.body).toHaveProperty('totalPages', 0);
    });
  });
});
