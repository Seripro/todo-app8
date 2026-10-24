import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import { todosTable } from "./db/schema.js";
import { eq } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL!);

const app = new Hono();

app.use(
  "/*",
  cors({
    origin: "http://localhost:5173",
    allowMethods: ["GET", "POST", "DELETE", "OPTIONS", "PATCH"],
    allowHeaders: ["Content-Type"],
  }),
);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/api/todos", async (c) => {
  try {
    const todos = await db.select().from(todosTable);
    return c.json(todos);
  } catch {
    return c.json({ error: "Failed to fetch todos" }, 500);
  }
});

app.post("/api/todos", async (c) => {
  try {
    const { title } = await c.req.json<{ title: string }>();
    if (!title || !title.trim()) {
      return c.json({ error: "Title is required" }, 400);
    }
    const newTodo = {
      title: title.trim(),
      completed: false,
      createdAt: new Date(),
    };
    const id = await db.insert(todosTable).values(newTodo).$returningId();
    const created = {
      id: id,
      ...newTodo,
    };
    return c.json(created, 201);
  } catch {
    return c.json({ error: "Failed to add todo" }, 500);
  }
});

app.patch("/api/todos/:id", async (c) => {
  try {
    const strId = await c.req.param("id");
    const id = Number(strId);
    const { completed } = await c.req.json();
    await db
      .update(todosTable)
      .set({
        completed: completed,
      })
      .where(eq(todosTable.id, id));
    return c.json({ id: id, message: "Updated successfully" }, 200);
  } catch {
    return c.json({ error: "Failed to update todo" }, 500);
  }
});

app.delete("/api/todos/:id", async (c) => {
  try {
    const strId = await c.req.param("id");
    const id = Number(strId);
    await db.delete(todosTable).where(eq(todosTable.id, id));
    return c.json({ id: id, message: "Deleted successfully" }, 200);
  } catch {
    return c.json({ error: "Failed to delete todo" }, 500);
  }
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
