import { jest } from "@jest/globals";

// ✅ mock auth
jest.unstable_mockModule("../src/middleware/authMiddleware.js", () => ({
  protect: (req, res, next) => {
    req.user = { _id: "123", availableRoles: ["buyer"] };
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