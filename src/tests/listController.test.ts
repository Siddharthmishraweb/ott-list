import request from 'supertest';
import app from '../app';
import mongoose from 'mongoose';
import Item from '../models/item';

describe('My List API', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb+srv://mishrasiddharth1999:Reenter2@cluster0.drc2anz.mongodb.net/ott?retryWrites=true&w=majority&appName=Cluster0', {
    });
  });

  afterEach(async () => {
    await Item.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should add an item to the list', async () => {
    const res = await request(app)
      .post('/api/mylist')
      .send({ userId: '1', contentId: 'm1', contentType: 'Movie' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('userId', '1');
  });

  it('should not add a duplicate item to the list', async () => {
    await request(app)
      .post('/api/mylist')
      .send({ userId: '1', contentId: 'm1', contentType: 'Movie' });

    const res = await request(app)
      .post('/api/mylist')
      .send({ userId: '1', contentId: 'm1', contentType: 'Movie' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'Item already in list');
  });

  it('should remove an item from the list', async () => {
    await request(app)
      .post('/api/mylist')
      .send({ userId: '1', contentId: 'm1', contentType: 'Movie' });

    const res = await request(app)
      .delete('/api/mylist/1/m1');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Item removed');
  });

  it('should list items in the user\'s list', async () => {
    await request(app)
      .post('/api/mylist')
      .send({ userId: '1', contentId: 'm1', contentType: 'Movie' });

    const res = await request(app)
      .get('/api/mylist/1');

    expect(res.status).toBe(200);
    expect(res.body.items.length).toBe(1);
  });
});
