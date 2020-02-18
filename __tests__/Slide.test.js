import fs from "fs";
import path from "path";
import { get } from "shvl";

import Slide from "../src/Slide";

const fixture = JSON.parse(
  fs.readFileSync(path.join(__dirname, "__fixtures__/example.json"))
);

describe("Slide", () => {
  describe(".content", () => {
    it("copies without reference the originalContent", () => {
      let originalContent = {
        greet: "hello world",
        deep: { thing: "original" }
      };

      const slide = new Slide(originalContent);
      let actual = slide.content;

      expect(actual).toEqual(originalContent);

      actual.greet = "new world";
      actual.deep.thing = "changed";
      expect(actual).toHaveProperty("greet", "new world");
      expect(originalContent).toHaveProperty("greet", "hello world");

      expect(actual).toHaveProperty("deep.thing", "changed");
      expect(originalContent).toHaveProperty("deep.thing", "original");
    });
  });

  describe(".styleIDs", () => {
    it("returns the ids for the slide", () => {
      let slideFixture = get(fixture, [
        "office:document-content",
        "office:body",
        "office:presentation",
        "draw:page",
        0
      ]);
      const slide = new Slide(slideFixture, fixture);
      let actual = slide.styleIDs;

      expect(actual).toContain("a776");
      expect(actual).toContain("a779");
      expect(actual).toContain("a786");
      expect(actual).toContain("a818");
    });
  });

  describe(".styles", () => {
    it("copies without reference the originalContent", () => {
      let originalContent = {
        greet: "hello world",
        deep: { thing: "original" }
      };

      const slide = new Slide(originalContent);
      let actual = slide.styles;

      expect(actual).toEqual(originalContent);

      actual.greet = "new world";
      actual.deep.thing = "changed";
      expect(actual).toHaveProperty("greet", "new world");
      expect(originalContent).toHaveProperty("greet", "hello world");

      expect(actual).toHaveProperty("deep.thing", "changed");
      expect(originalContent).toHaveProperty("deep.thing", "original");
    });

    it("includes the styles for the given slide", () => {
      let slideFixture = get(fixture, [
        "office:document-content",
        "office:body",
        "office:presentation",
        "draw:page",
        0
      ]);
      const slide = new Slide(slideFixture, fixture);
      let actual = slide.styles;

      expect(actual).toContainEqual(
        expect.objectContaining({
          "style:name": "a776"
        })
      );
    });
  });
});
