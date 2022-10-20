import { Configuration, OpenAIApi, CreateCompletionRequest } from "openai";
import { OpenAiSettings } from "./OpenAISettings";

export class OpenAICommands {
    private openai: OpenAIApi;
    private settings: OpenAiSettings;
    public completionConfig: CreateCompletionRequest;

    constructor(settings: OpenAiSettings) {
        const configuration = new Configuration({
            apiKey: settings.openAPIKey,
        });
        this.settings = settings;
        this.openai = new OpenAIApi(configuration);
        this.setDefaultCompletion();
    }

    setDefaultCompletion() {
        this.completionConfig = {
            model: "text-davinci-002",
            prompt: "",
            temperature: 0.7,
            max_tokens: 256,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        }
    }

    updateCompletionConfig <key extends keyof CreateCompletionRequest> (key: (keyof CreateCompletionRequest), value: CreateCompletionRequest[key]): void {
        this.completionConfig[key] = value;
        console.log(this.completionConfig);
    }


    async summarize(text: string, statusBarItemEl: HTMLElement) {
        statusBarItemEl.show();
        statusBarItemEl.setText("Waiting for response from OpenAI...")
        return await this.completion(this.settings.summary.prompt + "\n\n" + text).then(response => {
            statusBarItemEl.hide();
            return response.data.choices[0].text;
        }).catch(error => {
            console.error(error);
        })

    }

    async prompt(text: string) {
        return this.completion(text);
    }

    async improve(text: string, statusBarItemEl: HTMLElement) {
        statusBarItemEl.show();
        statusBarItemEl.setText("Waiting for response from OpenAI...")
        return await this.edit(text, this.settings.improvePrompt).then(response => {
            statusBarItemEl.hide();
            return response.data.choices[0].text;
        })
    }

    async edit(text: string = "", instruction: string = "") {
        if (text == '' || instruction == '') {
            console.warn("Instruction or Text selection is empty");
            return;
        }
        return this.openai.createEdit({
            model: "text-davinci-edit-001",
            input: text,
            instruction: instruction,
        });
    }

    async completion(text: string) {
        this.completionConfig.prompt = text;
        return this.openai.createCompletion(this.completionConfig);
    }
}