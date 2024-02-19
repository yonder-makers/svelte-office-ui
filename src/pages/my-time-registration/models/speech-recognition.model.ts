export interface SpeechRecognitionAssistant {
    onresult: (event: any) => void;
    onaudiostart: (event: any) => void;
    onspeechend: (event: any) => void;
    onnomatch: (event: any) => void;
    onerror: (event: any) => void;

    stop: () => void;
    start: () => void;
}