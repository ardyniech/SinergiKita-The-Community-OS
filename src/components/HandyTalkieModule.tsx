import React from 'react';
import { usePTT } from '../hooks/usePTT';
import { PTTHeader } from './ptt/PTTHeader';
import { PTTButton } from './ptt/PTTButton';
import { PTTHistoryList } from './ptt/PTTHistoryList';

export default function HandyTalkieModule() {
  const {
    isRecording,
    isUploading,
    messages,
    activeSpeaker,
    startRecording,
    stopRecording,
    playAudio
  } = usePTT();

  return (
    <div className="w-full max-w-lg mx-auto space-y-3 px-2 sm:px-3 pb-8">
      <PTTHeader activeSpeaker={activeSpeaker} />

      <PTTButton
        isRecording={isRecording}
        isUploading={isUploading}
        onStartRecording={startRecording}
        onStopRecording={stopRecording}
      />

      <PTTHistoryList messages={messages} onPlayAudio={playAudio} />
    </div>
  );
}
