import { Request, Response } from 'express';
import Item from '../models/item';
import redisClient from '../redisClient';

const CACHE_EXPIRATION = 60 * 60;


export const addItem = async (req: Request, res: Response) => {
  const { userId, contentId, contentType } = req.body;

  try {
    const existingItem = await Item.findOne({ userId, contentId });
    if (existingItem) {
      return res.status(400).json({ message: 'Item already in list' });
    }

    const item = new Item({ userId, contentId, contentType });
    await item.save();

    const keys = await redisClient.keys(`user:${userId}:list:*:*`);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }

    const items = await Item.find({ userId }).lean();
    const totalItems = items.length;

    await redisClient.setEx(`user:${userId}:totalItems`, CACHE_EXPIRATION, totalItems.toString());

    const limits = [10, 20, 30, 40, 50, 100];

    for (const limit of limits) {
      const totalPages = Math.ceil(totalItems / limit);

      for (let page = 1; page <= totalPages; page++) {
        const startIndex = (page - 1) * limit;
        const paginatedItems = items.slice(startIndex, startIndex + limit);

        const cacheKey = `user:${userId}:list:${page}:${limit}`;
        const response = { items: paginatedItems, totalPages };

        await redisClient.setEx(cacheKey, CACHE_EXPIRATION, JSON.stringify(response));
      }
    }

    res.status(201).json(item);
  } catch (error) {
    console.error('Error in addItem:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


export const removeItem = async (req: Request, res: Response) => {
  const { userId, contentId } = req.params;

  try {
    const item = await Item.findOneAndDelete({ userId, contentId });
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const items = await Item.find({ userId }).lean();
    const totalItems = items.length;

    await redisClient.setEx(`user:${userId}:totalItems`, CACHE_EXPIRATION, totalItems.toString());

    const limits = [10, 20, 30, 40, 50, 100];

    for (const limit of limits) {
      const totalPages = Math.ceil(totalItems / limit);

      for (let page = 1; page <= totalPages; page++) {
        const startIndex = (page - 1) * limit;
        const paginatedItems = items.slice(startIndex, startIndex + limit);

        const cacheKey = `user:${userId}:list:${page}:${limit}`;
        const response = { items: paginatedItems, totalPages };

        await redisClient.setEx(cacheKey, CACHE_EXPIRATION, JSON.stringify(response));
      }

      const overflowPage = 1;
      const overflowKey = `user:${userId}:list:${overflowPage}:${limit}`;
      const overflowResponse = { items, totalPages: 1 };

      await redisClient.setEx(overflowKey, CACHE_EXPIRATION, JSON.stringify(overflowResponse));
    }

    res.status(200).json({ message: 'Item removed' });
  } catch (error) {
    console.error('Error in removeItem:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const listItems = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  try {
    const cacheKey = `user:${userId}:list:${page}:${limit}`;
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      return res.status(200).json(JSON.parse(cachedData));
    }

    return res.status(200).json({ items: [], totalPages: 0 });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

