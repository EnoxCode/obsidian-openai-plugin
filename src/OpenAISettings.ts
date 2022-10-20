export interface OpenAiSettings {
	openAIKey: string;
	summary: {
		prompt: string,
		tokens: number,
		yamlKey: string
	}
	improvePrompt: string;
}