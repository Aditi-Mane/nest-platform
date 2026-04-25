import { jest } from "@jest/globals";

// ✅ Mock models
jest.unstable_mockModule("../src/models/Product.js", () => ({
  default: {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    countDocuments: jest.fn()
  }
}));

jest.unstable_mockModule("../src/models/Conversation.js", () => ({
  default: {
    findById: jest.fn()
  }
}));

jest.unstable_mockModule("../src/models/Order.js", () => ({
  default: {
    findOne: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    deleteOne: jest.fn()
  }
}));

jest.unstable_mockModule("../src/models/User.js", () => ({
  default: {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn()
  }
}));

jest.unstable_mockModule("../src/models/Cart.js", () => ({
  default: {
    updateOne: jest.fn(),
    updateMany: jest.fn()
  }
}));

// ✅ Mock S3
jest.unstable_mockModule("../src/utils/uploadToS3.js", () => ({
  uploadToS3: async () => "https://fake-image.com"
}));

// ✅ Mock bcrypt
jest.unstable_mockModule("bcrypt", () => ({
  default: {
    compare: async () => true
  }
}));

// ✅ Mock middleware
jest.unstable_mockModule("../src/middleware/authMiddleware.js", () => ({
  protect: (req, res, next) => {
    req.user = {
      _id: "123",
      id: "123",
      storeLocation: "Delhi"
    };
    next();
  }
}));

jest.unstable_mockModule("../src/middleware/sellerMiddleware.js", () => ({
  checkSeller: (req, res, next) => next()
}));

// import AFTER mocks
const request = (await import("supertest")).default;
const app = (await import("../src/app.js")).default;
const Product = (await import("../src/models/Product.js")).default;
const Conversation = (await import("../src/models/Conversation.js")).default;
const Order = (await import("../src/models/Order.js")).default;
const User = (await import("../src/models/User.js")).default;
const Cart = (await import("../src/models/Cart.js")).default;

beforeEach(() => {
  jest.clearAllMocks();
});

// test createProduct
describe("POST /create product", () => {

  test("should fail if missing fields", async () => {
    const res = await request(app)
      .post("/api/seller/create")
      .send({ name: "Test" });

    expect(res.statusCode).toBe(400);
  });

  test("should create product successfully", async () => {

    Product.create.mockResolvedValue({ name: "Test Product" });

    const res = await request(app)
      .post("/api/seller/create")
      .field("name", "Test Product")
      .field("description", "desc")
      .field("category", "electronics")
      .field("price", "100")
      .attach("images", Buffer.from("img"), "img.png");

    expect(res.statusCode).toBe(201);
  });

});

//test getMyProducts
describe("GET /my-products", () => {

  test("should fetch seller products", async () => {

    Product.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue([])
        })
      })
    });

    Product.countDocuments.mockResolvedValue(0);
    const res = await request(app)
      .get("/api/seller/my-products");

    expect(res.statusCode).toBe(200);
  });

});

//test confirmDeal
describe("PUT /confirm deal", () => {

  test("should confirm deal successfully", async () => {
    const validId = "507f1f77bcf86cd799439011";

    Conversation.findById.mockResolvedValue({
        _id: validId,
        productId: validId,
        buyerId: validId,
        sellerId: "123",
        save: async () => {}
    });

    Product.findById.mockResolvedValue({
      stock: 10,
      name: "Test",
      save: async () => {}
    });

    User.findById.mockResolvedValue({ name: "Buyer" });

    Order.findOne.mockResolvedValue(null);
    Order.create.mockResolvedValue({});

    const res = await request(app)
      .put("/api/seller/confirm/1")
      .send({
        quantity: 1,
        pricePerItem: 100,
        paymentMethod: "upi"
      });

    expect(res.statusCode).toBe(201);
  });

});

//test verifyOrderOtp
describe("POST /verify order otp", () => {

  test("should fail if otp missing", async () => {
    const res = await request(app)
      .post("/api/seller/orders/1")
      .send({});

    expect(res.statusCode).toBe(400);
  });

  test("should verify otp successfully", async () => {

    const validId = "507f1f77bcf86cd799439011";

    Order.findById.mockResolvedValue({
    sellerId: "123",
    otp: "hashed",
    otpExpiry: new Date(Date.now() + 10000),
    quantity: 1,
    productId: validId,
    buyerId: validId,
    conversationId: validId,
    status: "otp_generated",
    save: async () => {}
    });

    Product.findById.mockResolvedValue({
      stock: 1,
      status: "available",
      save: async () => {}
    });
    Cart.updateOne.mockResolvedValue({ acknowledged: true });
    Conversation.findById.mockResolvedValue({
      status: "deal_confirmed",
      save: async () => {}
    });

    const res = await request(app)
      .post("/api/seller/orders/1")
      .send({ otp: "123456" });

    expect(res.statusCode).toBe(200);
  });

});
