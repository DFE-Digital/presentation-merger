import parser from "xml2json";
import { get } from "shvl";
import path from "path";
import decompress from "decompress";
import main from "../index";

async function parseSlides(file) {
  const files = await decompress(file);
  const content = files.find(item => item.path === "content.xml");
  const json = parser.toJson(content.data);
  const presentation = JSON.parse(json);

  const slides = get(presentation, [
    "office:document-content",
    "office:body",
    "office:presentation",
    "draw:page"
  ]);
  return slides;
}

const file = path.join(__dirname, "__fixtures__/input.odp");
// Spike prototype, can we access the slides
it("plucks slide 5 from a source into a new presentation file", async () => {
  await main(file);
  let originalSlides = await parseSlides(file);
  let outputSlides = await parseSlides(
    path.join(path.dirname(file), "./output.odp")
  );
  expect(outputSlides).toEqual(originalSlides[4]);
});
