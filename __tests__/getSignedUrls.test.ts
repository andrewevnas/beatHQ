// __tests__/getSignedUrls.test.ts
// Mock lib/r2 so env.ts never runs.
jest.mock('@/lib/r2', () => ({
  r2: {},
  BUCKET: 'test-bucket',
}));

// Mock the presigner.
jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(),
}));

import { getSignedUrls } from '@/lib/getSignedUrls';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const mockGetSignedUrl = getSignedUrl as jest.Mock;

beforeEach(() => {
  mockGetSignedUrl.mockReset();
});

describe('getSignedUrls', () => {
  it('returns signed mp3 and wav URLs for a slug', async () => {
    mockGetSignedUrl
      .mockResolvedValueOnce('https://r2.example.com/signed-mp3')
      .mockResolvedValueOnce('https://r2.example.com/signed-wav');

    const result = await getSignedUrls('DragonFire_140bpm_Am');

    expect(result).toEqual({
      mp3Url: 'https://r2.example.com/signed-mp3',
      wavUrl: 'https://r2.example.com/signed-wav',
    });
    expect(mockGetSignedUrl).toHaveBeenCalledTimes(2);
  });

  it('uses 24-hour expiry', async () => {
    mockGetSignedUrl.mockResolvedValue('https://r2.example.com/url');

    await getSignedUrls('DragonFire_140bpm_Am');

    expect(mockGetSignedUrl).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ expiresIn: 86400 })
    );
  });

  it('uses correct R2 keys', async () => {
    mockGetSignedUrl.mockResolvedValue('https://r2.example.com/url');
    const { GetObjectCommand } = jest.requireActual('@aws-sdk/client-s3') as typeof import('@aws-sdk/client-s3');

    await getSignedUrls('GoldRush_120bpm_Cm');

    const calls = mockGetSignedUrl.mock.calls;
    const firstCommand = calls[0][1] as InstanceType<typeof GetObjectCommand>;
    const secondCommand = calls[1][1] as InstanceType<typeof GetObjectCommand>;
    expect(firstCommand.input.Key).toBe('beats/mp3/GoldRush_120bpm_Cm.mp3');
    expect(secondCommand.input.Key).toBe('beats/wav/GoldRush_120bpm_Cm.wav');
  });

  it('accepts a slug without bpm suffix', async () => {
    mockGetSignedUrl
      .mockResolvedValueOnce('https://r2.example.com/signed-mp3')
      .mockResolvedValueOnce('https://r2.example.com/signed-wav');
    const result = await getSignedUrls('feb1_85_C');
    expect(result.mp3Url).toBe('https://r2.example.com/signed-mp3');
    expect(mockGetSignedUrl).toHaveBeenCalledTimes(2);
  });

  it('throws when slug fails format validation', async () => {
    await expect(getSignedUrls('../../etc/passwd')).rejects.toThrow('Invalid slug format');
    expect(mockGetSignedUrl).not.toHaveBeenCalled();
  });
});
