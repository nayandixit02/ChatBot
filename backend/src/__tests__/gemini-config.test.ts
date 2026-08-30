import { describe, it, expect } from "@jest/globals";
import genAI from "../config/gemini-config.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

describe("gemini-config", () => {
  it("should export a GoogleGenerativeAI instance", () => {
    expect(genAI).toBeInstanceOf(GoogleGenerativeAI);
  });
});
