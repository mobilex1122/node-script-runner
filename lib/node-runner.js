'use babel';

import NodeRunnerView from './node-runner-view';
import { CompositeDisposable, File } from 'atom';

export default {
  terminalService:null,
  nodeRunnerView: null,
  modalPanel: null,
  subscriptions: null,
  consumeTerminalService (terminalService) {
    console.log("Terminal Loaded");
    this.terminalService = terminalService
  },
  activate(state) {
    console.log("Activeted");
    this.nodeRunnerView = new NodeRunnerView(state.nodeRunnerViewState,this.terminalService);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.nodeRunnerView.getElement(),
      visible: false
    });

    //this.projectfile = new File()

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'node-runner:toggle': () => this.toggle()
      'node-runner:openScriptMenu': () => this.openScriptMenu()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.nodeRunnerView.destroy();
  },

  serialize() {
    return {
      nodeRunnerViewState: this.nodeRunnerView.serialize()
    };
  },

  toggle() {
  openScriptMenu() {
    console.log('NodeRunner was toggled!');
    // Launch `somecommand --foo --bar --baz` in a terminal.
    // main = this.modalPanel.getItem()
    // const message = document.createElement('button');
    // message.textContent = 'hy terminal';
    // message.addEventListener("click",() => {
    //   this.terminalService.run(['somecommand --foo --bar --baz'])
    // })
    // main.appendChild(message);
    let project = ""
    const previousActiveItem = atom.workspace.getActivePaneItem()
			if (typeof previousActiveItem !== 'undefined' && typeof previousActiveItem.getPath === 'function') {
				cwd = previousActiveItem.getPath()
				const dir = atom.project.relativizePath(cwd)[0]
				if (dir) {
					project = dir
				}
			} else if (typeof previousActiveItem !== 'undefined' && typeof previousActiveItem.selectedPath === 'string') {
				cwd = previousActiveItem.selectedPath
				const dir = atom.project.relativizePath(cwd)[0]
				if (dir) {
					project = dir
				}
			} else {
				project = atom.project.getPaths()[0]
			}
      console.log(project);

      const packagefilePath = project + '/package.json';
      const packagefile = new File("/home/mobilex/github/node-runner/package.json")

      (async () => {
          console.log(packagefile.read())
      })()


    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};
