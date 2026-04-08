// __tests__/getBeats.test.ts
jest.mock('@/lib/r2', () => ({
  r2: { send: jest.fn() },
  BUCKET: 'test-bucket',
  R2_PUBLIC_URL: 'https://test.r2.dev',
}));

import { getBeats } from '@/lib/getBeats';
import { r2 } from '@/lib/r2';

const mockSend = r2.send as jest.Mock;

beforeEach(() => {
  mockSend.mockReset();
});

describe('getBeats', () => {
  it('returns parsed beats from R2', async () => {
    mockSend.mockResolvedValueOnce({
      Contents: [
        { Key: 'beats/previews/DragonFire_140bpm_Am.mp3' },
        { Key: 'beats/previews/NeonShadows_93bpm_F#m.mp3' },
      ],
    });

    const beats = await getBeats();

    expect(beats).toHaveLength(2);
    expect(beats[0]).toEqual({
      slug: 'DragonFire_140bpm_Am',
      name: 'DragonFire',
      bpm: 140,
      key: 'Am',
      previewUrl: 'https://test.r2.dev/beats/previews/DragonFire_140bpm_Am.mp3',
      coverUrl: 'https://test.r2.dev/beats/covers/DragonFire_140bpm_Am.jpg',
    });
    expect(beats[1]).toEqual({
      slug: 'NeonShadows_93bpm_F#m',
      name: 'NeonShadows',
      bpm: 93,
      key: 'F#m',
      previewUrl: 'https://test.r2.dev/beats/previews/NeonShadows_93bpm_F#m.mp3',
      coverUrl: 'https://test.r2.dev/beats/covers/NeonShadows_93bpm_F#m.jpg',
    });
  });

  it('skips unparseable filenames and continues', async () => {
    mockSend.mockResolvedValueOnce({
      Contents: [
        { Key: 'beats/previews/DragonFire_140bpm_Am.mp3' },
        { Key: 'beats/previews/bad-filename.mp3' },
        { Key: 'beats/previews/GoldRush_120bpm_Cm.mp3' },
      ],
    });

    const beats = await getBeats();

    expect(beats).toHaveLength(2);
    expect(beats[0]?.slug).toBe('DragonFire_140bpm_Am');
    expect(beats[1]?.slug).toBe('GoldRush_120bpm_Cm');
  });

  it('returns empty array when Contents is empty', async () => {
    mockSend.mockResolvedValueOnce({ Contents: [] });
    expect(await getBeats()).toEqual([]);
  });

  it('returns empty array when Contents is undefined', async () => {
    mockSend.mockResolvedValueOnce({});
    expect(await getBeats()).toEqual([]);
  });

  it('skips the folder placeholder object (key equal to prefix)', async () => {
    mockSend.mockResolvedValueOnce({
      Contents: [
        { Key: 'beats/previews/' },
        { Key: 'beats/previews/DragonFire_140bpm_Am.mp3' },
      ],
    });

    const beats = await getBeats();
    expect(beats).toHaveLength(1);
  });
});
