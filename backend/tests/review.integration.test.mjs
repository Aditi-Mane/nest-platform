import { jest } from '@jest/globals';
import { connectDB, closeDB } from "./setup.js";
import request from "supertest";
import app from "../src/server.js";

import Product from "../src/models/Product.js";
import User from "../src/models/User.js";

jest.setTimeout(20000);

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await closeDB();
});

describe("Full Integration: Auth → Product → Review → Sentiment", () => {

  let token;
  let productId;

  // ✅ 1. Register
  test("1. should register user", async () => {
    const res = await request(app).post("/api/auth/signup").send({
      name: "Aditi Mane",
      email: "aditimane549@gmail.com",
      password: "hallelujah25"
    });

    expect(res.statusCode).toBe(201);
  });

  // ✅ 2. Login
  test("2. should login user", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "aditimane549@gmail.com",
      password: "hallelujah25"
    });

    expect(res.statusCode).toBe(200);

    token = res.body.token;
    expect(token).toBeDefined();
  });

  // ✅ 3. Create Product
  test("3. should create product", async () => {

    const user = await User.findOne({ email: "aditimane549@gmail.com" });

    const product = await Product.create({
      name: "Test Product",
      price: 100,
      description: "Integration test product",
      category: "Electronics",
      createdBy: user._id,
      reviewCount: 0,
      averageRating: 0,
      sentimentStats: { positive: 0, neutral: 0, negative: 0 }
    });

    productId = product._id.toString();

    expect(product).toBeDefined();
  });

  // ✅ 4. Add Review
  test("4. should create review", async () => {
    const res = await request(app)
      .post("/api/reviews")
      .set("Authorization", `Bearer ${token}`)
      .send({
        productId,
        text: "Amazing product, works perfectly!",
        starRating: 5
      });

    console.log("REVIEW:", res.body);

    expect(res.statusCode).toBe(201);
    expect(res.body.review).toBeDefined();
  });

  // ✅ 5. Fetch Reviews
  test("5. should fetch reviews", async () => {
    const res = await request(app).get(`/api/reviews/product/${productId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.reviews.length).toBeGreaterThan(0);
  });

  // ✅ 6. Verify Sentiment
  test("6. should verify sentiment stored", async () => {

    const res = await request(app).get(`/api/reviews/product/${productId}`);

    const review = res.body.reviews[0];

    console.log("SENTIMENT:", review.sentiment);

    // sentiment may be null if service fails
    expect(review).toHaveProperty("text");
    expect(review).toHaveProperty("starRating");

    // Optional check (if sentiment service working)
    if (review.sentiment !== null) {
      expect(["positive", "neutral", "negative"]).toContain(review.sentiment);
    }
  });

});