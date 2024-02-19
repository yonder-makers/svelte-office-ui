import type { Languages } from '../enums/languages.enum';

export interface AssistantSettings {    
  languageCode: Languages,
  isSpeakResponse: boolean,
  isAutoListen: boolean,
  isHeyYonder: boolean
}