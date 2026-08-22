import { post } from './api.js';

export function sendVoiceCommand(transcript, language) {
  return post('/commands', { transcript, language });
}