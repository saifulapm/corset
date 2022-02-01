// @ts-check

/**
 * @typedef {import('./declaration').Declaration} Declaration
 */

export class Rule {
  /**
   * @param {string} selector
   */
  constructor(selector) {
    /** @type {String} */
    this.selector = selector;
    /** @type {Array<Declaration>} */
    this.declarations = [];
    /** @type {number} */
    this.specificity = 0;
  }

  /** @param {Declaration} declaration */
  addDeclaration(declaration) {
    this.declarations.push(declaration);
  }
}