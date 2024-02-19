export const synth = window.speechSynthesis || window.webkitSpeechSynthesis;
const pitchValue = 1;
const rateValue = 1;

let voices = [];
synth.cancel();

function populateVoiceList(): void {
    voices = synth.getVoices()
}

populateVoiceList();
if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = populateVoiceList;
}

function getVoice(voiceCode: string): SpeechSynthesisVoice {
    return voices.find(voice => voice.name === voiceCode);
}

export function speak(text: string, voiceCode: string): SpeechSynthesisUtterance {
  if (text !== '') {
    const utterThis = new SpeechSynthesisUtterance(text);
    utterThis.voice = getVoice(voiceCode);
    utterThis.pitch = pitchValue;
    utterThis.rate = rateValue;

    synth.speak(utterThis);
    return utterThis;
  }
}