import Manifest from '../src/Manifest';
describe('Manifest', () => {
  let subject;
  beforeEach(() => {
    subject = new Manifest();
  });
  describe('.merge(zip, counter)', () => {
    it.todo('merges the given zip file manifest into doc');
  });

  describe('.toXml(formatted)', () => {
    it('returns XML ', () => {
      jest.spyOn(subject, 'doc', 'get').mockReturnValue({ hello: 'world' });
      expect(subject.toXml()).toMatchInlineSnapshot(`
        "<?xml version=\\"1.0\\" encoding=\\"UTF-8\\" ?>
        <hello>world</hello>
        "
      `);
      expect(subject.toXml(false)).toMatchInlineSnapshot(`
        "<?xml version=\\"1.0\\" encoding=\\"UTF-8\\" ?>
        <hello>world</hello>"
      `);

      jest.spyOn(subject, 'doc', 'get').mockReturnValue('');
      expect(subject.toXml()).toMatchInlineSnapshot(`""`);
    });
  });
});
