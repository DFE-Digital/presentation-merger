import { get } from 'shvl';

export default class Style {
  constructor(stylesData, presentation) {
    this.data = stylesData;
    this.presentation = presentation;
    this.doc;
  }

  get namespaces() {
    let out = {};
    for (let [key, value] of Object.entries(
      this.data['office:document-styles']
    )) {
      if (key.startsWith('xmlns:')) {
        out[key] = value;
      }
    }
    return out;
  }

  get masterPagesOriginal() {
    let data =
      get(
        this.data,
        'office:document-styles.office:master-styles.style:master-page'
      ) || [];
    if (!Array.isArray(data)) {
      return [data];
    } else {
      return data;
    }
  }

  get masterPages() {
    return this.presentation.slides.flatMap(slide => {
      return this.masterPagesOriginal.filter(
        d => d['style:name'] === slide.masterPageName
      );
    });
  }

  get presentationPageLayoutsSource() {
    let data =
      get(
        this.data,
        'office:document-styles.office:styles.style:presentation-page-layout'
      ) || [];
    if (!Array.isArray(data)) {
      return [data];
    } else {
      return data;
    }
  }

  /**
   * @todo modify the image file references
   */
  get presentationPageLayouts() {
    return this.presentation.slides.flatMap(slide => {
      return this.presentationPageLayoutsSource.filter(
        d => d['style:name'] === slide.presentationLayoutPageName
      );
    });
  }

  get stylesOriginal() {
    return (
      get(this.data, 'office:document-styles.office:styles.style:style') || []
    );
  }

  /**
   * @todo this doesnt seem quite right.
   */
  get styles() {
    return this.presentation.slides.flatMap(slide => {
      console.log(slide.styles);
      return this.stylesOriginal.filter(d =>
        slide.styleIDs.includes(d['style:name'])
      );
    });
  }
}
