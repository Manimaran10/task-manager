import User, { IUser } from '../models/Users';
import { BaseRepository } from './base.repository';

export class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(User);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return await this.model.findOne({ email }).select('+password');
  }

  async findByIdWithPassword(id: string): Promise<IUser | null> {
    return await this.model.findById(id).select('+password');
  }

  async updateProfile(id: string, data: { name?: string }): Promise<IUser | null> {
    return await this.update(id, { $set: data });
  }

  async searchUsers(query: string, excludeId?: string): Promise<IUser[]> {
    const filter: any = {
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    };

    if (excludeId) {
      filter._id = { $ne: excludeId };
    }

    return await this.find(filter, { limit: 10 });
  }
}

export default new UserRepository();