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

    res.status(201).json(item);
  } catch (error) {
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

    const keys = await redisClient.keys(`user:${userId}:list:*:*`);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }

    res.status(200).json({ message: 'Item removed' });
  } catch (error) {
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

    const items = await Item.find({ userId })
      .skip((+page - 1) * +limit)
      .limit(+limit);

    const totalItems = await Item.countDocuments({ userId });
    const totalPages = Math.ceil(totalItems / +limit);

    const response = { items, totalPages };

    await redisClient.setEx(cacheKey, CACHE_EXPIRATION, JSON.stringify(response));

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
