import { parseFilename } from '@/lib/parseFilename';

describe('parseFilename', () => {
  describe('happy path', () => {
    it('parses a standard filename', () => {
      const result = parseFilename('DragonFire_140bpm_Am.mp3');
      expect(result).toEqual({
        slug: 'DragonFire_140bpm_Am',
        name: 'DragonFire',
        bpm: 140,
        key: 'Am',
      });
    });

    it('parses a sharp key', () => {
      const result = parseFilename('NeonShadows_93bpm_F#m.mp3');
      expect(result).toEqual({
        slug: 'NeonShadows_93bpm_F#m',
        name: 'NeonShadows',
        bpm: 93,
        key: 'F#m',
      });
    });

    it('parses a hyphenated display name', () => {
      const result = parseFilename('Dragon-Fire_140bpm_Am.mp3');
      expect(result).toEqual({
        slug: 'Dragon-Fire_140bpm_Am',
        name: 'Dragon Fire',
        bpm: 140,
        key: 'Am',
      });
    });

    it('parses a .wav extension', () => {
      const result = parseFilename('GoldRush_120bpm_Cm.wav');
      expect(result).not.toBeNull();
      expect(result?.slug).toBe('GoldRush_120bpm_Cm');
    });

    it('parses a .jpg extension (cover art)', () => {
      const result = parseFilename('GoldRush_120bpm_Cm.jpg');
      expect(result).not.toBeNull();
      expect(result?.bpm).toBe(120);
    });

    it('handles uppercase BPM suffix', () => {
      const result = parseFilename('Voltage_144BPM_Em.mp3');
      expect(result).not.toBeNull();
      expect(result?.bpm).toBe(144);
    });
  });

  describe('error cases — returns null', () => {
    it('returns null for missing BPM segment', () => {
      expect(parseFilename('DragonFire_Am.mp3')).toBeNull();
    });

    it('returns null for non-integer BPM', () => {
      expect(parseFilename('DragonFire_fastbpm_Am.mp3')).toBeNull();
    });

    it('returns null for zero BPM', () => {
      expect(parseFilename('DragonFire_0bpm_Am.mp3')).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(parseFilename('')).toBeNull();
    });

    it('returns null for filename with no underscore segments', () => {
      expect(parseFilename('DragonFire.mp3')).toBeNull();
    });

    it('returns null for missing key segment', () => {
      expect(parseFilename('DragonFire_140bpm_.mp3')).toBeNull();
    });
  });
});
