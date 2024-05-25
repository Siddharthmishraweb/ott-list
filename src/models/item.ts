import { Schema, model, Document } from 'mongoose';

interface IItem extends Document {
  userId: string;
  contentId: string;
  contentType: 'Movie' | 'TVShow';
}

const itemSchema = new Schema<IItem>({
  userId: { type: String, required: true, index: true },
  contentId: { type: String, required: true, index: true },
  contentType: { type: String, required: true }
});

const Item = model<IItem>('Item', itemSchema);

export default Item;
