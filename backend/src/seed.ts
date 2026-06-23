import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user/user.entity';
import { Product } from './product/product.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  // ── Users ────────────────────────────────────────────────
  const userRepo = app.get<Repository<User>>(getRepositoryToken(User));

  const users = [
    {
      email: 'admin@example.com',
      passwordHash: await bcrypt.hash('admin123', 10),
      role: 'admin',
    },
    {
      email: 'user@example.com',
      passwordHash: await bcrypt.hash('user123', 10),
      role: 'user',
    },
  ];

  for (const u of users) {
    const exists = await userRepo.findOne({ where: { email: u.email } });
    if (!exists) {
      await userRepo.save(userRepo.create(u));
      console.log(`✅ User created: ${u.email}`);
    } else {
      console.log(`⏭️  User exists: ${u.email}`);
    }
  }

  // ── Products ─────────────────────────────────────────────
  const productRepo = app.get<Repository<Product>>(getRepositoryToken(Product));

const products = [
  // Burgers
  {
    nameEn: 'Classic Cheeseburger',
    nameAr: 'تشيز برجر كلاسيك',
    descriptionEn: 'Juicy beef patty with cheddar cheese, lettuce, tomato and our special sauce',
    descriptionAr: 'شريحة لحم بقري عصيرية مع جبن شيدر وخس وطماطم وصلصتنا الخاصة',
    price: 12.99,
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80',
    category: 'Burgers',
    isAvailable: true,
  },
  {
    nameEn: 'BBQ Bacon Burger',
    nameAr: 'برجر بيكون بالباربيكيو',
    descriptionEn: 'Smoky BBQ sauce, crispy bacon, caramelized onions and pepper jack cheese',
    descriptionAr: 'صلصة باربيكيو مدخنة وبيكون مقرمش وبصل مكرمل وجبن بيبر جاك',
    price: 14.99,
    imageUrl: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=500&q=80',
    category: 'Burgers',
    isAvailable: true,
  },
  {
    nameEn: 'Mushroom Swiss Burger',
    nameAr: 'برجر مشروم سويسري',
    descriptionEn: 'Sautéed mushrooms, Swiss cheese, garlic aioli on a brioche bun',
    descriptionAr: 'مشروم مقلي وجبن سويسري وصلصة الثوم على خبز بريوش',
    price: 13.99,
    imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&q=80',
    category: 'Burgers',
    isAvailable: true,
  },

  // Pizza
  {
    nameEn: 'Margherita Pizza',
    nameAr: 'بيتزا مارغريتا',
    descriptionEn: 'San Marzano tomato sauce, fresh mozzarella and basil on a thin crust',
    descriptionAr: 'صلصة طماطم سان مارزانو وموزاريلا طازجة وريحان على عجينة رفيعة',
    price: 13.99,
    imageUrl: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=500&q=80',
    category: 'Pizza',
    isAvailable: true,
  },
  {
    nameEn: 'Pepperoni Pizza',
    nameAr: 'بيتزا بيبروني',
    descriptionEn: 'Classic tomato sauce loaded with pepperoni and melted mozzarella',
    descriptionAr: 'صلصة طماطم كلاسيكية مع بيبروني وموزاريلا مذابة',
    price: 15.99,
    imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&q=80',
    category: 'Pizza',
    isAvailable: true,
  },
  {
    nameEn: 'BBQ Chicken Pizza',
    nameAr: 'بيتزا دجاج بالباربيكيو',
    descriptionEn: 'Grilled chicken, BBQ sauce, red onion and mozzarella cheese',
    descriptionAr: 'دجاج مشوي وصلصة باربيكيو وبصل أحمر وجبن موزاريلا',
    price: 16.99,
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80',
    category: 'Pizza',
    isAvailable: true,
  },

  // Salads
  {
    nameEn: 'Caesar Salad',
    nameAr: 'سلطة سيزر',
    descriptionEn: 'Crisp romaine, parmesan, croutons and creamy Caesar dressing',
    descriptionAr: 'خس روماني مقرمش وجبن بارميزان وخبز محمص وصلصة سيزر كريمية',
    price: 9.99,
    imageUrl: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=500&q=80',
    category: 'Salads',
    isAvailable: true,
  },
  {
    nameEn: 'Greek Salad',
    nameAr: 'سلطة يونانية',
    descriptionEn: 'Cucumber, tomato, olives, red onion and feta cheese with olive oil dressing',
    descriptionAr: 'خيار وطماطم وزيتون وبصل أحمر وجبن فيتا مع صلصة زيت الزيتون',
    price: 10.99,
    imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=500&q=80',
    category: 'Salads',
    isAvailable: true,
  },
  {
    nameEn: 'Grilled Chicken Salad',
    nameAr: 'سلطة الدجاج المشوي',
    descriptionEn: 'Mixed greens, grilled chicken breast, avocado and balsamic vinaigrette',
    descriptionAr: 'خضار مشكلة ودجاج مشوي وأفوكادو وصلصة بلسمية',
    price: 12.99,
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80',
    category: 'Salads',
    isAvailable: true,
  },

  // Desserts
  {
    nameEn: 'Chocolate Lava Cake',
    nameAr: 'كيك اللافا بالشوكولاتة',
    descriptionEn: 'Warm chocolate cake with a molten center, served with vanilla ice cream',
    descriptionAr: 'كيك شوكولاتة دافئ بمركز منصهر يقدم مع آيس كريم فانيليا',
    price: 7.99,
    imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&q=80',
    category: 'Desserts',
    isAvailable: true,
  },
  {
    nameEn: 'New York Cheesecake',
    nameAr: 'تشيز كيك نيويورك',
    descriptionEn: 'Classic creamy cheesecake on a graham cracker crust with berry compote',
    descriptionAr: 'تشيز كيك كريمي كلاسيكي على قاعدة بسكويت مع مربى التوت',
    price: 6.99,
    imageUrl: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&q=80',
    category: 'Desserts',
    isAvailable: true,
  },
  {
    nameEn: 'Tiramisu',
    nameAr: 'تيراميسو',
    descriptionEn: 'Espresso-soaked ladyfingers layered with mascarpone cream and cocoa',
    descriptionAr: 'بسكويت مغموس بالإسبريسو مع كريمة ماسكاربوني ومسحوق الكاكاو',
    price: 7.49,
    imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&q=80',
    category: 'Desserts',
    isAvailable: true,
  },
];

  for (const p of products) {
    const exists = await productRepo.findOne({ where: { nameEn: p.nameEn } });
    if (!exists) {
      await productRepo.save(productRepo.create(p));
      console.log(`✅ Product created: ${p.nameEn}`);
    } else {
      console.log(`⏭️  Product exists: ${p.nameEn}`);
    }
  }

  await app.close();
  console.log('\n🎉 Seed complete!');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});