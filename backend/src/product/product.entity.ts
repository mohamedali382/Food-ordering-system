import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nameEn: string;

  @Column()
  nameAr: string;

  @Column('text')
  descriptionEn: string;

  @Column('text')
  descriptionAr: string;

  @Column('decimal')
  price: number;

  @Column()
  imageUrl: string;

  @Column({ default: true })
  isAvailable: boolean;

  @Column({ type: 'text', default: 'Burgers' })
  category: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}