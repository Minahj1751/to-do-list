import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(userId: string, createCategoryDto: CreateCategoryDto) {
    const category = this.categoryRepository.create({
      ...createCategoryDto,
      user_id: userId,
    });
    return this.categoryRepository.save(category);
  }

  async findAll(userId: string) {
    return this.categoryRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(userId: string, id: string) {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    if (category.user_id !== userId) {
      throw new ForbiddenException('Access denied');
    }
    return category;
  }

  async update(userId: string, id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.findOne(userId, id);
    Object.assign(category, updateCategoryDto);
    return this.categoryRepository.save(category);
  }

  async remove(userId: string, id: string) {
    const category = await this.findOne(userId, id);
    await this.categoryRepository.remove(category);
    return { message: 'Category deleted successfully' };
  }

  async createDefaultCategories(userId: string) {
    const defaultCategories = [
      { name: 'Study', icon: '📚' },
      { name: 'Work', icon: '💼' },
      { name: 'Personal', icon: '👤' },
      { name: 'Shopping', icon: '🛒' },
      { name: 'Health', icon: '❤️' },
      { name: 'Project', icon: '🚀' },
      { name: 'Other', icon: '📌' },
    ];

    const categories: Category[] = [];
    for (const cat of defaultCategories) {
      const existing = await this.categoryRepository.findOne({
        where: { user_id: userId, name: cat.name },
      });
      if (!existing) {
        const category = this.categoryRepository.create({
          ...cat,
          user_id: userId,
        });
        categories.push(await this.categoryRepository.save(category));
      }
    }
    return categories;
  }
}