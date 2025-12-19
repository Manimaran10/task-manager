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

    async findAll(): Promise<IUser[]> {
    return await this.model.find({}, 'name email _id').sort({ name: 1 });
  }

  async searchUsers(searchTerm: string = ''): Promise<IUser[]> {
    const query: any = {};
    
    if (searchTerm && searchTerm.trim() !== '') {
      query.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    return await this.model.find(query, 'name email _id')
      .sort({ name: 1 })
      .limit(20);
  }

  // async searchUsers(query: string, excludeId?: string): Promise<IUser[]> {
  //   const filter: any = {
  //     $or: [
  //       { name: { $regex: query, $options: 'i' } },
  //       { email: { $regex: query, $options: 'i' } }
  //     ]
  //   };

  //   if (excludeId) {
  //     filter._id = { $ne: excludeId };
  //   }

  //   return await this.find(filter, { limit: 10 });
  // }
}

export default new UserRepository();