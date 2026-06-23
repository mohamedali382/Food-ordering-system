import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { User } from '../user/user.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

    async create(userId: number, createOrderDto: any): Promise<Order> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
        throw new NotFoundException('User not found');
    }

    const order = this.ordersRepository.create({
        ...createOrderDto,
        user,
    });

    const saved = await (this.ordersRepository.save(order) as unknown as Promise<Order>);
    return saved;
    }

  async findAll(): Promise<Order[]> {
    return this.ordersRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByUser(userId: number): Promise<Order[]> {
    return this.ordersRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async update(id: number, updateOrderDto: Partial<Order>): Promise<Order> {
    await this.ordersRepository.update(id, updateOrderDto);
    return this.findOne(id);
  }

  async updateStatus(id: number, status: string): Promise<Order> {
    const validStatuses = [
      'PENDING',
      'PREPARING',
      'DELIVERING',
      'COMPLETED',
      'CANCELLED',
    ];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException('Invalid order status');
    }
    return this.update(id, { status } as any);
  }

  async delete(id: number): Promise<void> {
    const result = await this.ordersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Order not found');
    }
  }

  async getOrdersByStatus(status: string): Promise<Order[]> {
    return this.ordersRepository.find({
      where: { status },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getOrderStats(): Promise<any> {
    const orders = await this.ordersRepository.find();
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce(
      (sum, order) => sum + parseFloat(order.totalAmount as any),
      0,
    );
    const ordersByStatus = {
      pending: orders.filter((o) => o.status === 'PENDING').length,
      preparing: orders.filter((o) => o.status === 'PREPARING').length,
      delivering: orders.filter((o) => o.status === 'DELIVERING').length,
      completed: orders.filter((o) => o.status === 'COMPLETED').length,
      cancelled: orders.filter((o) => o.status === 'CANCELLED').length,
    };

    return {
      totalOrders,
      totalRevenue,
      ordersByStatus,
    };
  }
}
