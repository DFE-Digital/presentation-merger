import fs from "fs";
import path from "path";
import { get } from "shvl";

import Slide from "../src/Slide";

const fixture = JSON.parse(
  fs.readFileSync(path.join(__dirname, "__fixtures__/file1.json"))
);

const slidesFixture = get(fixture, [
  "office:document-content",
  "office:body",
  "office:presentation",
  "draw:page"
]);

describe("Slide", () => {
  describe(".content", () => {
    it("copies without reference the originalContent", () => {
      let originalContent = {
        greet: "hello world",
        deep: { thing: "original" }
      };

      const slide = new Slide(originalContent, fixture);
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
      const slide = new Slide(slidesFixture[0], fixture);
      let actual = slide.styleIDs;
      expect(actual).toMatchSnapshot();
    });
  });

  describe(".styles", () => {
    it("includes the styles for the given slide", () => {
      const slide = new Slide(slidesFixture[0], fixture);
      let actual = slide.styles;

      expect(actual).toMatchSnapshot()
    });
  });

  describe(".masterStyleIDs", () => {
    it("finds all the parent id's that are required to bring across from the master Styles.xml document", () => {
      const slide = new Slide(slidesFixture[0], fixture);
      let subject = slide.masterStyleIDs;
      expect(subject).toMatchSnapshot();
    });
  });
});
