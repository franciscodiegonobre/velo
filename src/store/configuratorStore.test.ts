import { describe, it, expect } from 'vitest';
import {
  calculateTotalPrice,
  calculateInstallment,
  formatPrice,
  CarConfiguration,
} from './configuratorStore';

describe('configuratorStore pure functions', () => {
  describe('calculateTotalPrice', () => {
    it('should return base price (40000) when default aero wheels and no optionals are selected', () => {
      const config: CarConfiguration = {
        exteriorColor: 'glacier-blue',
        interiorColor: 'carbon-black',
        wheelType: 'aero',
        optionals: [],
      };
      expect(calculateTotalPrice(config)).toBe(40000);
    });

    it('should add sport wheels price (+2000) when wheelType is sport', () => {
      const config: CarConfiguration = {
        exteriorColor: 'glacier-blue',
        interiorColor: 'carbon-black',
        wheelType: 'sport',
        optionals: [],
      };
      expect(calculateTotalPrice(config)).toBe(42000);
    });

    it('should add optional feature prices correctly', () => {
      const configWithPark: CarConfiguration = {
        exteriorColor: 'glacier-blue',
        interiorColor: 'carbon-black',
        wheelType: 'aero',
        optionals: ['precision-park'],
      };
      expect(calculateTotalPrice(configWithPark)).toBe(45500);

      const configWithFlux: CarConfiguration = {
        exteriorColor: 'midnight-black',
        interiorColor: 'deep-blue',
        wheelType: 'aero',
        optionals: ['flux-capacitor'],
      };
      expect(calculateTotalPrice(configWithFlux)).toBe(45000);
    });

    it('should calculate total with sport wheels and all optionals (52500)', () => {
      const fullConfig: CarConfiguration = {
        exteriorColor: 'lunar-white',
        interiorColor: 'carbon-black',
        wheelType: 'sport',
        optionals: ['precision-park', 'flux-capacitor'],
      };
      // Base (40000) + Sport Wheels (2000) + Park (5500) + Flux (5000) = 52500
      expect(calculateTotalPrice(fullConfig)).toBe(52500);
    });

    it('should handle undefined or malformed optionals safely', () => {
      const malformedConfig = {
        exteriorColor: 'glacier-blue',
        interiorColor: 'carbon-black',
        wheelType: 'aero',
        optionals: undefined as unknown as any[],
      } as CarConfiguration;
      expect(calculateTotalPrice(malformedConfig)).toBe(40000);
    });
  });

  describe('calculateInstallment', () => {
    it('should calculate 12-month installment with 2% compound interest correctly', () => {
      // 40000 total: 40000 * 0.02 * (1.02^12) / ((1.02^12) - 1) ≈ 3782.38
      const installmentBase = calculateInstallment(40000);
      expect(installmentBase).toBe(3782.38);

      // 52500 total: 52500 * 0.02 * (1.02^12) / ((1.02^12) - 1) ≈ 4964.38
      const installmentFull = calculateInstallment(52500);
      expect(installmentFull).toBe(4964.38);
    });

    it('should handle zero price', () => {
      expect(calculateInstallment(0)).toBe(0);
    });
  });

  describe('formatPrice', () => {
    it('should format numbers to Brazilian Real (BRL) currency format', () => {
      const formatted = formatPrice(40000);
      const normalized = formatted.replace(/\u00a0/g, ' ');
      expect(normalized).toBe('R$ 40.000,00');
    });

    it('should format decimal numbers correctly', () => {
      const formatted = formatPrice(3782.38);
      const normalized = formatted.replace(/\u00a0/g, ' ');
      expect(normalized).toBe('R$ 3.782,38');
    });
  });
});
