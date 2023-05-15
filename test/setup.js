import { jest } from "@jest/globals";
import util from "../lib/util.js";

const mockUniqueId = "abc123";
jest.unstable_mockModule("../lib/util.js", () => ({
  __esModule: true,
  ...util,
  uniqueId: jest.fn(() => mockUniqueId),
}));
