'use babel';

export default class NodeRunnerView {
  constructor(serializedState,terminalService) {
    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('node-runner');

    // Create message element
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

}
