import { jest } from "@jest/globals";

jest.unstable_mockModule("../src/middleware/sellerMiddleware.js", () => ({
  checkSeller: (req, res, next) => next() // ✅ always allow
}));
//Test updateProfile (S3 Mock)
jest.unstable_mockModule("../src/utils/uploadToS3.js", () => ({
  uploadToS3: async () => "https://s3-url/avatar.png"
}));

jest.unstable_mockModule("../src/utils/deleteFromS3.js", () => ({
  deleteFromS3: async () => {}
}));


// ✅ mock auth middleware PROPERLY
jest.unstable_mockModule("../src/middleware/authMiddleware.js", () => ({
  protect: (req, res, next) => {
    req.user = {
      _id: "123",
      availableRoles: ["buyer", "seller"],
      sellerStatus: "approved",
      activeRole: "buyer",
      save: async () => {}
    };
    next();
  }
}));

const request = (await import("supertest")).default;
const app = (await import("../src/app.js")).default;
const User = (await import("../src/models/User.js")).default;

describe("PATCH /choose-role", () => {

  test("should return 400 for invalid role", async () => {
    const res = await request(app)
      .patch("/api/users/choose-role")
      .send({ selectedRole: "admin" });

    expect(res.statusCode).toBe(400);
  });

  test("should set user role successfully", async () => {

    User.findById = async () => ({
      _id: "123",
      availableRoles: ["buyer"],
      activeRole: "buyer",
      sellerStatus: "none",
      save: async () => {}
    });

    const res = await request(app)
      .patch("/api/users/choose-role")
      .send({ selectedRole: "seller" });

    expect(res.statusCode).toBe(200);
    expect(res.body.activeRole).toBe("seller");
  });

});
//getCurrentUser testing 
describe("GET /me", () => {

  test("should return user data", async () => {

    User.findById = () => ({
      select: async () => ({
        _id: "123",
        email: "test@test.com"
      })
    });

    const res = await request(app)
      .get("/api/users/me");

    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe("test@test.com");
  });

});

describe("PUT /updatePassword", () => {

  test("should reject weak password", async () => {
    const res = await request(app)
      .put("/api/users/updatePassword")
      .send({ password: "123" });

    expect(res.statusCode).toBe(400);
  });

  test("should update password successfully", async () => {

    User.findById = async () => ({
      password: "old",
      save: async () => {}
    });

    const res = await request(app)
      .put("/api/users/updatePassword")
      .send({ password: "abc123" });

    expect(res.statusCode).toBe(200);
  });

});

describe("GET /count", () => {

  test("should return total users", async () => {
    User.countDocuments = async () => 5;

    const res = await request(app)
      .get("/api/users/count");

    expect(res.statusCode).toBe(200);
    expect(res.body.totalUsers).toBe(5);
  });

});

describe("GET /search", () => {

  test("should return 400 if email missing", async () => {
    const res = await request(app)
      .get("/api/users/search");

    expect(res.statusCode).toBe(400);
  });

  test("should return user if found", async () => {

    User.findOne = () => ({
      select: async () => ({
        email: "test@test.com",
        name: "Test User"
      })
    });

    const res = await request(app)
      .get("/api/users/search?email=test@test.com");

    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe("test@test.com");
  });

});

describe("PUT /switch-role", () => {

  test("should return invalid role", async () => {
    const res = await request(app)
      .put("/api/users/switch-role")
      .send({ role: "admin" });

    expect(res.statusCode).toBe(400);
  });

  test("should switch role successfully", async () => {
  const res = await request(app)
    .put("/api/users/switch-role")
    .send({ role: "seller" });

  expect(res.statusCode).toBe(200);
});

  test("should switch role successfully", async () => {

    // override req.user dynamically
    app.use((req, res, next) => {
      req.user = {
        _id: "123",
        availableRoles: ["buyer", "seller"],
        activeRole: "buyer",
        save: async () => {}
      };
      next();
    });

    const res = await request(app)
      .put("/api/users/switch-role")
      .send({ role: "seller" });

    expect(res.statusCode).toBe(200);
  });

});

describe("PUT /updateProfile", () => {

  test("should update profile without file", async () => {

    User.findById = async () => ({
      collegeName: "Old",
      payoutUPI: "old@upi",
      save: async function () { return this; }
    });

    const res = await request(app)
      .put("/api/users/updateProfile")
      .send({
        collegeName: "New College",
        payoutUPI: "new@upi"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.user.collegeName).toBe("New College");
  });

});

describe("PUT /updateStore", () => {

  test("should update store successfully", async () => {

    User.findById = async () => ({
      storeName: "Old Store",
      save: async function () { return this; }
    });

    const res = await request(app)
      .put("/api/users/updateStore")
      .field("storeName", "New Store") // form-data

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Store updated successfully");
  });

});

describe("PUT /update-avatar", () => {

  test("should return 400 if no file", async () => {
    const res = await request(app)
      .put("/api/users/update-avatar");

    expect(res.statusCode).toBe(400);
  });

  test("should update avatar successfully", async () => {

    User.findById = async () => ({
      avatar: "",
      save: async function () { return this; }
    });

    const res = await request(app)
      .put("/api/users/update-avatar")
      .attach("avatar", Buffer.from("test"), "avatar.png");

    expect(res.statusCode).toBe(200);
  });

});

describe("DELETE /delete", () => {

  test("should delete account successfully", async () => {

    const mockUser = {
      _id: "123",
      name: "Test",
      email: "test@test.com",
      save: async function () { return this; }
    };

    // req.user is already mocked globally
    Object.assign(mockUser, {
      availableRoles: ["buyer"],
      sellerStatus: "none"
    });

    const res = await request(app)
      .delete("/api/users/delete");

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Account deleted successfully");
  });

});