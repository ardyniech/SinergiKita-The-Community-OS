import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, boolean, numeric } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  role: text('role').default('member'), // e.g., 'admin', 'bendahara', 'ketua', 'member'
  createdAt: timestamp('created_at').defaultNow(),
});

export const finances = pgTable('finances', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  type: text('type').notNull(), // 'income' or 'expense'
  amount: numeric('amount').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  date: timestamp('date').notNull().defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  finances: many(finances),
}));

export const financesRelations = relations(finances, ({ one }) => ({
  author: one(users, {
    fields: [finances.userId],
    references: [users.id],
  }),
}));
