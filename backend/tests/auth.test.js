import { jest } from "@jest/globals";

// ✅ Mock external dependencies

jest.unstable_mockModule("../src/models/User.js", () => ({
  default: {
    findOne: jest.fn(),
    create: jest.fn()
  }
}));

jest.unstable_mockModule("bcrypt", () => ({
  default: {
    hash: async () => "hashed",
    compare: async () => true
  }
}));

jest.unstable_mockModule("../src/utils/generateToken.js", () => ({
  generateToken: () => "fake-token"
}));

jest.unstable_mockModule("../src/utils/mailer.js", () => ({
  getTransporter: () => ({
    sendMail: async () => {}
  })
}));

// import AFTER mocks
const request = (await import("supertest")).default;
const app = (await import("../src/app.js")).default;
const User = (await import("../src/models/User.js")).default;

//test signup
describe("POST /signup", () => {

  test("should fail for invalid email", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({ name: "Priya", email: "invalid", password: "abc123" });

    expect(res.statusCode).toBe(400);
  });

  test("should fail if user exists", async () => {
    User.findOne.mockResolvedValue({ email: "test@test.com" });

    const res = await request(app)
      .post("/api/auth/signup")
      .send({ name: "Priya", email: "test@test.com", password: "abc123" });

    expect(res.statusCode).toBe(400);
  });

  test("should signup successfully", async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({
      save: async () => {}
    });

    const res = await request(app)
      .post("/api/auth/signup")
      .send({ name: "Priya", email: "test@test.com", password: "abc123" });

    expect(res.statusCode).toBe(201);
  });

});

//test Login
describe("POST /login", () => {

  test("should fail if user not found", async () => {
    User.findOne.mockReturnValue({
      select: async () => null
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@test.com", password: "abc123" });

    expect(res.statusCode).toBe(401);
  });

  test("should login successfully", async () => {
    User.findOne.mockReturnValue({
      select: async () => ({
        password: "hashed",
        isDeleted: false,
        save: async () => {}
      })
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@test.com", password: "abc123" });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBe("fake-token");
  });

});

//test verify otp
describe("POST /verify-otp", () => {

  test("should fail for invalid otp", async () => {
    const res = await request(app)
      .post("/api/auth/verify-email-otp")
      .send({ email: "test@test.com", otp: "123" });

    expect(res.statusCode).toBe(400);
  });

  test("should verify otp successfully", async () => {

    User.findOne.mockResolvedValue({
      verificationOtp: "hashed",
      verificationOtpExpiry: Date.now() + 10000,
      save: async () => {}
    });

    const res = await request(app)
      .post("/api/auth/verify-email-otp")
      .send({ email: "test@test.com", otp: "123456" });

    expect(res.statusCode).toBe(200);
  });

});

//test forgot password
describe("POST /forgot-password", () => {

  test("should fail if user not found", async () => {
    User.findOne.mockResolvedValue(null);

    const res = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: "test@test.com" });

    expect(res.statusCode).toBe(404);
  });

  test("should send OTP", async () => {
    User.findOne.mockResolvedValue({
      save: async () => {}
    });

    const res = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: "test@test.com" });

    expect(res.statusCode).toBe(200);
  });

});

//test reset password
describe("POST /reset-password", () => {

  test("should fail if passwords mismatch", async () => {
    const res = await request(app)
      .post("/api/auth/create-new-pass")
      .send({
        email: "test@test.com",
        pass: "abc123",
        confirmPass: "abc"
      });

    expect(res.statusCode).toBe(400);
  });

  test("should reset password", async () => {

    User.findOne.mockResolvedValue({
      save: async () => {}
    });

    const res = await request(app)
      .post("/api/auth/create-new-pass")
      .send({
        email: "test@test.com",
        pass: "abc123",
        confirmPass: "abc123"
      });

    expect(res.statusCode).toBe(200);
  });

});