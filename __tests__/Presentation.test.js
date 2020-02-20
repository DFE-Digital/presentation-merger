import fs from 'fs';
import path from 'path';
import Presenation from '../src/Presentation';
import Slide from '../src/Slide';

const fixture = JSON.parse(
  fs.readFileSync(path.join(__dirname, "__fixtures__/example.json"))
);

describe("Presentation", () => {
  describe('.slides', () => {
    it('creates an array of slides', () => {
      const presenation = new Presenation(fixture)
      let actual = presenation.slides

      expect(actual).toBeInstanceOf(Array)
      expect(actual[0]).toBeInstanceOf(Slide)
    })
  })
})