import { moveImageReferences, namespaces } from './utils';

export default class Style {
  constructor(content, _, manifest) {
    this.data = moveImageReferences(content, manifest);
    this.namespaces = namespaces(content['office:document-styles']);
  }
}
