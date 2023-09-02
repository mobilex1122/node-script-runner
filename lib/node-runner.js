'use babel';

import NodeRunnerView from './node-runner-view';
import { CompositeDisposable, File } from 'atom';
const fs = require('fs/promises');
import SelectListView from 'atom-select-list'
const os = require('os');
const platform = os.platform();

export default {
  terminalService:null,
  nodeRunnerView: null,
  modalPanel: null,
  subscriptions: null,
  config: {
    manager: {
      title: "Package Manager",
      type: 'string',
      default: 'npm',
      enum: ['npm', 'pnpm'],
      description: 'Select your preferred package manager',
    },
  },
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

  openScriptMenu() {
    console.log('NodeRunner was toggled!');

    mainui = this.modalPanel.getItem()
    mainui.innerHTML = ""
    const loading = document.createElement('p');
    loading.textContent = "Loading"
    mainui.appendChild(loading);


    // Project folder selector is from x-terminal-reloaded source code.
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
      fs.readFile(packagefilePath).then((data) => {
        const packageData = JSON.parse(data)
        mainui.innerHTML = ""
        if (packageData.scripts) {
          const list = document.createElement('ol');
          list.classList.add("list-group")
          // Object.keys(packageData.scripts).forEach((script) => {
          //   const element = document.createElement('li');
          //   console.log(script);
          //   element.classList.add("event")
          //   element.textContent = script;
          //   element.addEventListener("click",() => {
          //     this.terminalService.run([`echo command: ${script}`])
          //   })
          //   list.appendChild(element)
          // });
          const usersSelectList = new SelectListView({
            items: Object.keys(packageData.scripts),
            emptyMessage: 'No scripts found',
            elementForItem: (item, {index, selected, visible}) => {
              const li = document.createElement('li')
              li.classList.add('event', 'two-lines')
              li.textContent = item
              const titleEl = document.createElement('div')
              titleEl.classList.add('primary-line')
              titleEl.textContent = item
              let secondaryEl = document.createElement('div')
              secondaryEl.classList.add('secondary-line')
              secondaryEl.style.display = 'flex'
              secondaryEl.textContent = packageData.scripts[item]
              packageData.scripts
              li.appendChild(titleEl)
              li.appendChild(secondaryEl)
              return li
            },
            didConfirmSelection: (script) => {
              this.modalPanel.hide()
              let cdCommand = "cd"
              if (platform === 'win32') {
                cdCommand == "dir"
              }
              const manager = atom.config.get('node-runner.manager');
              if (manager == "npm") {
                this.terminalService.run([`${cdCommand} ${project}`,`npm run ${script}`])
              }
              if (manager == "pnpm") {
                this.terminalService.run([`${cdCommand} ${project}`,`pnpm run ${script}`])
              }

            },
            didCancelSelection: () => {
              this.modalPanel.hide()
            }
          })

          mainui.appendChild(usersSelectList.element);
          this.modalPanel.show()
          usersSelectList.focus()
        } else {
          const noscript = document.createElement('p');
          noscript.textContent = "No scirpts found."
          mainui.appendChild(noscript);
          atom.notifications.addInfo("node-runner: No Scripts Found")
        }
      }).catch((error) => {
        console.log(error);
        atom.notifications.addWarning("node-runner: project.json not found in project root")
      });


    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};
