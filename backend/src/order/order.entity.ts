import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  user: User;

  @Column('json')
  items: any; // Simplified for prototype: array of { productId, quantity, price }

  @Column('decimal')
  totalAmount: number;

  @Column()
  paymentMethod: string; // 'ONLINE' or 'COD'

  @Column({ default: 'PENDING' })
  status: string; // 'PENDING', 'PREPARING', 'DELIVERING', 'COMPLETED', 'CANCELLED'

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
