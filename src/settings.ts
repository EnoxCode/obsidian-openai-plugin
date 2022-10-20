import OpenAPIPlugin from 'src/main';
import { PluginSettingTab, Setting, App } from 'obsidian';


export class SampleSettingTab extends PluginSettingTab {
	plugin: OpenAPIPlugin;

	constructor(app: App, plugin: OpenAPIPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'OpenAPI Settings' });

		new Setting(containerEl)
			.setName('OpenAPI Key')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your OPEN KEY')
				.setValue(this.plugin.settings.openAIKey)
				.onChange(async (value) => {
					this.plugin.settings.openAIKey = value;
					await this.plugin.saveSettings();
				}).inputEl.setAttribute("type", "password"));
		/**
		 * Summarization Settings
		 */
		var summary = containerEl.createEl("h2");
		summary.setText("Summary")
		new Setting(containerEl)
			.setName('Summarization Prompt')
			.setDesc('This prompt is added to the completion request to OpenAI')
			.addTextArea(text => text
				.setValue(this.plugin.settings.summary.prompt || 'Summarize this text: ')
				.onChange(async (value) => {
					this.plugin.settings.summary.prompt = value;
					await this.plugin.saveSettings();
				}));
		var slider = new Setting(containerEl)
			.setName('Tokens')
			.setDesc('The number of requested response tokens.')
			.addSlider(text => text
				.setValue(this.plugin.settings.summary.tokens)
				.onChange(async (value) => {
					this.plugin.settings.summary.tokens = value;
					number.setText(value.toString());
					await this.plugin.saveSettings();
				})
				.setLimits(50, 512, 10));
		var number = slider.settingEl.createDiv();
		number.setText(this.plugin.settings.summary.tokens.toString());
		number.style.marginLeft = "10px";
		new Setting(containerEl)
			.setName('YAML key')
			.setDesc('The key into which the summary is saved after retrieval. This key is in the frontmatter.')
			.addText(text => text
				.setPlaceholder('Enter your key')
				.setValue(this.plugin.settings.summary.yamlKey)
				.onChange(async (value) => {
					this.plugin.settings.summary.yamlKey = value;
					await this.plugin.saveSettings();
				}));
		/**
		 * Improvement Settings
		 */
		var improve = containerEl.createEl("h2");
		improve.setText("Improvement AI")
		new Setting(containerEl)
			.setName('Improve Prompt')
			.setDesc('This prompt is added to the edit request to OpenAI')
			.addTextArea(text => text
				.setValue(this.plugin.settings.improvePrompt || 'Improve my text and fix spelling mistakes')
				.onChange(async (value) => {
					this.plugin.settings.improvePrompt = value;
					await this.plugin.saveSettings();
				}));
	}
}