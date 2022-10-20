import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, parseYaml } from 'obsidian';
import {SampleSettingTab} from './settings';
import { OpenAICommands } from 'src/OpenAICommands';
import { parse, stringify } from 'yaml'
import { OpenAiSettings } from 'src/OpenAISettings';
import { ImproveModal } from 'src/improveModal';
import { PromptModal } from 'src/advancedPromptModal';

const DEFAULT_SETTINGS: OpenAiSettings = {
	openAIKey: '',
	improvePrompt: "Improve my text and fix spelling mistakes",
	summary: {
		prompt: "Summary the following text:",
		tokens: 265,
		yamlKey: "summary"
	}
}

export default class OpenAPIPlugin extends Plugin {
	settings: OpenAiSettings;
	private openAICommands: OpenAICommands;

	async onload() {
		console.log("Loading OpenAI Plugin");
		await this.loadSettings();

		this.openAICommands = new OpenAICommands(this.settings);
		// // This creates an icon in the left ribbon.
		// const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
		// 	// Called when the user clicks the icon.
		// 	new Notice('This is a notice!');
		// });
		// // Perform additional things with the ribbon
		// ribbonIconEl.addClass('my-plugin-ribbon-class');

		// // This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.className

		// // This adds a simple command that can be triggered anywhere
		// this.addCommand({
		// 	id: 'open-sample-modal-simple',
		// 	name: 'Open sample modal (simple)',
		// 	callback: () => {
		// 		new SampleModal(this.app).open();
		// 	}
		// });
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'openai-summary',
			name: 'Summarize Selection',
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				const file = view.file;				
				const metadata = this.app.metadataCache.getFileCache(file);

				console.log("summuary");
				
				if (metadata?.frontmatter && 'summary' in metadata?.frontmatter) {
					const fileContent = await this.app.vault.cachedRead(file);
					const {position: {start, end}} = metadata.frontmatter;
					const article = this.splitFrontmatterAndContent(fileContent, end.line);
					const summuary = await this.openAICommands.summarize(editor.getSelection(), statusBarItemEl);
					const frontmatterObj = parseYaml(article.frontmatter);
					frontmatterObj.summary = summuary?.replace(/(\r\n|\n|\r)/gm, "")+"\n";
					console.log(frontmatterObj)		
					// stringify and concat
					const newFrontmatter = stringify(frontmatterObj);
					const newFullFileContent = `---\n${newFrontmatter}---\n${article.content}`;
					await this.app.vault.modify(file, newFullFileContent);
				}


			}
		});

		this.addCommand({
			id: 'openai-prompt',
			name: 'Prompt Selection',
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				const file = view.file;				

				statusBarItemEl.show();
				statusBarItemEl.setText("Waiting for response from OpenAI...")
				const improvedText = await this.openAICommands.prompt(editor.getSelection()).then(response => {
					return response.data.choices[0].text as string;
				})
				statusBarItemEl.hide();
				editor.replaceSelection(improvedText);

			}
		});		

		this.addCommand({
			id: 'openai-improve',
			name: 'Improve Selection',
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				const file = view.file;				
				const metadata = this.app.metadataCache.getFileCache(file);

				const improvedText = await this.openAICommands.improve(editor.getSelection(), statusBarItemEl);

				new ImproveModal(this.app,editor.getSelection(), improvedText as string, (text)=>{
					editor.replaceSelection(text)
				}).open();

			}
		});

		this.addCommand({
			id: 'openai-prompt-advanced',
			name: 'Advanced Prompt Selection',
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				new PromptModal(this.app, editor.getSelection(), (text)=> {
					editor.replaceSelection(text)
				}, this.openAICommands).open();

			}
		});		
				
		// // This adds a complex command that can check whether the current state of the app allows execution of the command
		// this.addCommand({
		// 	id: 'open-sample-modal-complex',
		// 	name: 'Open sample modal (complex)',
		// 	checkCallback: (checking: boolean) => {
		// 		// Conditions to check
		// 		const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
		// 		if (markdownView) {
		// 			// If checking is true, we're simply "checking" if the command can be run.
		// 			// If checking is false, then we want to actually perform the operation.
		// 			if (!checking) {
		// 				new SampleModal(this.app).open();
		// 			}

		// 			// This command will only show up in Command Palette when the check function returns true
		// 			return true;
		// 		}
		// 	}
		// });

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		// this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
		// 	console.log('click', evt);
		// });

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
	
	private splitFrontmatterAndContent(content: string, fmEndLine: number): {
		content: string,
		frontmatter: string,
	} {
		// split content to -> [0, fmEndLine), [fmEndLine + 1, EOL)
		let splitPosFm = -1;
		while (fmEndLine-- && splitPosFm++ < content.length) {
			splitPosFm = content.indexOf("\n", splitPosFm);
			if (splitPosFm < 0) throw Error("Split front matter failed");
		}
		let splitPosContent = splitPosFm + 1;
		splitPosContent = content.indexOf("\n", splitPosContent) + 1;

		return {
			content: content.substring(splitPosContent),
			frontmatter: content.substring(0, splitPosFm),
		};
	}
}
