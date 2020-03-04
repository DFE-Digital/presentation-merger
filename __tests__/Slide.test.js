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
  let subject
  beforeEach(() => {
    subject = new Slide(slidesFixture[0], fixture);
  })

  describe(".styleIDs", () => {
    it("returns the ids for the slide", () => {
      expect(subject.styleIDs).toMatchSnapshot();
    });
  });

  describe(".styles", () => {
    it("includes the styles for the given slide", () => {
      expect(subject.styles).toMatchSnapshot()
    });
  });
});
