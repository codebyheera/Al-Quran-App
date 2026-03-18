/**
 * components/AudioPlayer.jsx — Per-verse audio player
 * Uses HTML5 audio with the EveryAyah CDN URL
 */

import { useAudio } from '../context/AudioContext';
import './AudioPlayer.css';

export default function AudioPlayer({ verse, fullPlaylist, index }) {
  const { currentVerse, isPlaying, togglePlay, playPlaylist } = useAudio();

  if (!verse?.audio) return null;

  const isCurrent = currentVerse?.audio === verse.audio;

  function handleToggle() {
    if (isCurrent) {
      togglePlay();
    } else if (fullPlaylist && index !== undefined) {
      playPlaylist(fullPlaylist, index);
    }
  }

  return (
    <div className="audio-player">
      <button
        className={`audio-play-btn ${isCurrent && isPlaying ? 'playing' : ''}`}
        onClick={handleToggle}
        title={isCurrent && isPlaying ? 'Pause' : 'Play recitation'}
      >
        {isCurrent && isPlaying ? '⏸' : '▶'}
      </button>
    </div>
  );
}
