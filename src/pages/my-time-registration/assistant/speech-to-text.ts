import type { SpeechRecognitionAssistant } from '../models';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export function generateRecognition(defaultLanguage: string): SpeechRecognitionAssistant {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = defaultLanguage;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    return recognition;
}
