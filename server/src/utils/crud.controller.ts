import { Request, Response } from 'express';
import { Model, Document } from 'mongoose';
import { catchAsync } from './catchAsync';
import { AppError } from '../middlewares/error.middleware';
import { APIFeatures } from './apiFeatures';

export class CrudController<T extends Document> {
  constructor(private model: Model<T>) {}

  getAll = catchAsync(async (req: Request, res: Response) => {
    const features = new APIFeatures(this.model.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    
    const docs = await features.query;
    const total = await this.model.countDocuments(features.query.getFilter());

    res.status(200).json({
      success: true,
      results: docs.length,
      total,
      data: docs,
    });
  });

  getOne = catchAsync(async (req: Request, res: Response) => {
    const doc = await this.model.findById(req.params.id);
    if (!doc) throw new AppError('Document not found', 404);

    res.status(200).json({
      success: true,
      data: doc,
    });
  });

  createOne = catchAsync(async (req: Request, res: Response) => {
    const newDoc = await this.model.create(req.body);

    res.status(201).json({
      success: true,
      data: newDoc,
    });
  });

  updateOne = catchAsync(async (req: Request, res: Response) => {
    const doc = await this.model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) throw new AppError('Document not found', 404);

    res.status(200).json({
      success: true,
      data: doc,
    });
  });

  deleteOne = catchAsync(async (req: Request, res: Response) => {
    // Soft delete if isDeleted exists, otherwise hard delete
    const doc = await this.model.findById(req.params.id);
    
    if (!doc) throw new AppError('Document not found', 404);

    if ('isDeleted' in doc) {
      await this.model.findByIdAndUpdate(req.params.id, { isDeleted: true });
    } else {
      await this.model.findByIdAndDelete(req.params.id);
    }

    res.status(204).json({
      success: true,
      data: null,
    });
  });
}
