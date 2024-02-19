import { Languages } from '../enums/languages.enum';
import type { Language } from '../models/language.model';

export const languages: {[key: string]: Language} = {
    'ro': {
        name: 'Romanian',
        shortCode: Languages.Romanian,
        grammarCode: 'ro-RO',
        speakerVoice: 'Google UK English Male'
    },
    'en': {
        name: 'English',
        shortCode: Languages.English,
        grammarCode: 'en-US',
        speakerVoice: 'Google UK English Male'
    },
    'de': {
        name: 'German',
        shortCode: Languages.German,
        grammarCode: 'de-DE',
        speakerVoice: 'Google Deutsch'
    },
    'fr': {
        name: 'French',
        shortCode: Languages.French,
        grammarCode: 'fr-FR',
        speakerVoice: 'Google français'
    },
}

export const availableLanguages = [Languages.Romanian, Languages.English, Languages.German, Languages.French]