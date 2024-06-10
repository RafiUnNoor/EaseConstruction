import { BaseExtension } from './BaseExtension.js';
import { DataGridPanel } from './DataGridPanel.js';

class DataGridExtension extends BaseExtension {
    constructor(viewer, options) {
        super(viewer, options);
        this._button = null;
        this._panel = null;
    }

    async load() {
        await super.load();
        try {
            await Promise.all([
                this.loadScript('https://unpkg.com/tabulator-tables@6.2.1/dist/js/tabulator.min.js', 'Tabulator'),
                this.loadStylesheet('https://unpkg.com/tabulator-tables@6.2.1/dist/css/tabulator.min.css')
            ]);
            console.log('DataGridExtension loaded.');
            return true;
        } catch (error) {
            console.error('Error loading DataGridExtension:', error);
            return false;
        }
    }

    unload() {
        super.unload();
        if (this._button) {
            this.removeToolbarButton(this._button);
            this._button = null;
        }
        if (this._panel) {
            this._panel.setVisible(false);
            this._panel.uninitialize();
            this._panel = null;
        }
        console.log('DataGridExtension unloaded.');
        return true;
    }

    onToolbarCreated() {
        this._panel = new DataGridPanel(this, 'dashboard-datagrid-panel', 'Data Grid', { x: 10, y: 10 });
        this._button = this.createToolbarButton('dashboard-datagrid-button', 'https://img.icons8.com/small/32/activity-grid.png', 'Show Data Grid');
        this._button.onClick = (event) => {
            event.preventDefault(); // Prevent default action if necessary
            this._panel.setVisible(!this._panel.isVisible());
            this._button.setState(this._panel.isVisible() ? Autodesk.Viewing.UI.Button.State.ACTIVE : Autodesk.Viewing.UI.Button.State.INACTIVE);
            if (this._panel.isVisible() && this.viewer.model) {
                this.update();
            }
        };
    }

    onModelLoaded(model) {
        super.onModelLoaded(model);
        if (this._panel && this._panel.isVisible()) {
            this.update();
        }
    }

    async update() {
        const dbids = await this.findLeafNodes(this.viewer.model);
        this._panel.update(this.viewer.model, dbids);
    }

    loadScript(url, id) {
        return new Promise((resolve, reject) => {
            if (document.getElementById(id)) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = url;
            script.id = id;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    loadStylesheet(url) {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = url;
            link.onload = resolve;
            link.onerror = reject;
            document.head.appendChild(link);
        });
    }
}

Autodesk.Viewing.theExtensionManager.registerExtension('DataGridExtension', DataGridExtension);
