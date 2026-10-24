import {
  boolean,
  int,
  mysqlTable,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const todosTable = mysqlTable("todos_table", {
  id: int().primaryKey().autoincrement(),
  title: varchar({ length: 255 }).notNull(),
  completed: boolean().notNull(),
  createdAt: timestamp().notNull(),
});
