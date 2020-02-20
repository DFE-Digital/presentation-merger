import fs from "fs";
import path from "path";
import { get } from "shvl";
import Presentation from "../src/Presentation";
import Document from '../src/Document';

const fixture1 = JSON.parse(
  fs.readFileSync(path.join(__dirname, "__fixtures__/file1.json"))
);

const fixture2 = JSON.parse(
  fs.readFileSync(path.join(__dirname, "__fixtures__/file2.json"))
);

describe("Document", () => {
  describe(".merge", () => {
    it("merges multiple presentations", () => {
      let doc = new Document();
      let fixtures = [fixture1, fixture2];
      let presentations = [];

      fixtures.forEach(fixture => {
        presentations.push(new Presentation(fixture));
      });

      presentations.forEach(pres => {
        doc.merge(pres);
      });

      let slides = get(
        doc.doc,
        "office:document-content.office:body.office:presentation.draw:page"
      );

      fixtures.forEach(fixture => {
        let fixtureSlides = get(
          fixture,
          "office:document-content.office:body.office:presentation.draw:page"
        );
        fixtureSlides.forEach(slide => {
          expect(slides).toContainEqual(slide);
        });
      });
    });
  });
});
