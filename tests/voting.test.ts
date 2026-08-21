import { describe, it, expect } from 'vitest';
import {
  calculatePollResults,
  formatPollCategory,
  generatePollWhatsAppShareText
} from '../src/modules/voting/logic/votingUtils';

describe('Voting Module Logic', () => {
  it('should calculate poll results percentage accurately', () => {
    const options = [
      { id: 'opt_1', text: 'Pilihan A', voteCount: 30 },
      { id: 'opt_2', text: 'Pilihan B', voteCount: 70 }
    ];
    const results = calculatePollResults(options, 100);
    expect(results[0].percentage).toBe(30);
    expect(results[1].percentage).toBe(70);
  });

  it('should handle 0 total votes without divide-by-zero error', () => {
    const options = [
      { id: 'opt_1', text: 'Pilihan A', voteCount: 0 },
      { id: 'opt_2', text: 'Pilihan B', voteCount: 0 }
    ];
    const results = calculatePollResults(options, 0);
    expect(results[0].percentage).toBe(0);
    expect(results[1].percentage).toBe(0);
  });

  it('should format poll category correctly', () => {
    expect(formatPollCategory('rembuk_rt')).toBe('Rembuk RT / RW');
    expect(formatPollCategory('pemilihan')).toBe('Pemilihan Pengurus');
    expect(formatPollCategory('keamanan')).toBe('Keamanan Lingkungan');
    expect(formatPollCategory('fasilitas')).toBe('Pengadaan Fasilitas');
    expect(formatPollCategory('anggaran')).toBe('Anggaran & Iuran');
  });

  it('should generate WhatsApp share text for polling', () => {
    const text = generatePollWhatsAppShareText({
      tenantName: 'RT 05 Sukamaju',
      pollTitle: 'Pemilihan Lokasi Pos Ronda Baru',
      category: 'Keamanan Lingkungan',
      endDate: '2026-09-10',
      totalVotes: 42
    });

    expect(text).toContain('RT 05 Sukamaju');
    expect(text).toContain('Pemilihan Lokasi Pos Ronda Baru');
    expect(text).toContain('42 suara');
  });
});
