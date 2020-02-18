import Slide from "../src/Slide";

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

  describe(".style", () => {
    it("copies without reference the originalContent", () => {
      let originalContent = {
        greet: "hello world",
        deep: { thing: "original" }
      };

      const slide = new Slide(originalContent);
      let actual = slide.style;

      expect(actual).toEqual(originalContent);

      actual.greet = "new world";
      actual.deep.thing = "changed";
      expect(actual).toHaveProperty("greet", "new world");
      expect(originalContent).toHaveProperty("greet", "hello world");

      expect(actual).toHaveProperty("deep.thing", "changed");
      expect(originalContent).toHaveProperty("deep.thing", "original");
    });
  });
});
