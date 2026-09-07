import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateTotalPrice,
  calculateInstallment,
  formatPrice,
  CarConfiguration,
  useConfiguratorStore,
  Order,
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

describe('useConfiguratorStore state actions', () => {
  beforeEach(() => {
    // Reset store before each test
    useConfiguratorStore.setState({
      configuration: {
        exteriorColor: 'glacier-blue',
        interiorColor: 'carbon-black',
        wheelType: 'aero',
        optionals: [],
      },
      viewMode: 'exterior',
      orders: [],
      currentUserEmail: null,
    });
  });

  it('should toggle optionals correctly', () => {
    const store = useConfiguratorStore.getState();
    expect(store.configuration.optionals).toEqual([]);

    // Add optional
    store.toggleOptional('precision-park');
    expect(useConfiguratorStore.getState().configuration.optionals).toEqual(['precision-park']);

    // Add another
    useConfiguratorStore.getState().toggleOptional('flux-capacitor');
    expect(useConfiguratorStore.getState().configuration.optionals).toEqual(['precision-park', 'flux-capacitor']);

    // Remove first optional
    useConfiguratorStore.getState().toggleOptional('precision-park');
    expect(useConfiguratorStore.getState().configuration.optionals).toEqual(['flux-capacitor']);
  });

  it('should handle login and getUserOrders correctly', () => {
    const store = useConfiguratorStore.getState();
    const testEmail = 'test@example.com';
    const mockOrder: Order = {
      id: '123',
      configuration: store.configuration,
      totalPrice: 40000,
      customer: { name: 'Test', surname: 'User', email: testEmail, phone: '123', cpf: '123', store: 'A' },
      paymentMethod: 'avista',
      status: 'APROVADO',
      createdAt: new Date().toISOString(),
    };

    // Try to login without orders
    expect(store.login(testEmail)).toBe(false);
    expect(useConfiguratorStore.getState().currentUserEmail).toBeNull();
    expect(useConfiguratorStore.getState().getUserOrders()).toEqual([]);

    // Add order
    store.addOrder(mockOrder);
    
    // Login should now succeed
    expect(useConfiguratorStore.getState().login(testEmail)).toBe(true);
    expect(useConfiguratorStore.getState().currentUserEmail).toBe(testEmail);

    // Should return the user's orders
    expect(useConfiguratorStore.getState().getUserOrders()).toHaveLength(1);
    expect(useConfiguratorStore.getState().getUserOrders()[0].id).toBe('123');

    // Logout
    useConfiguratorStore.getState().logout();
    expect(useConfiguratorStore.getState().currentUserEmail).toBeNull();
    expect(useConfiguratorStore.getState().getUserOrders()).toEqual([]);
  });

  it('should update configuration settings', () => {
    const store = useConfiguratorStore.getState();
    
    store.setExteriorColor('midnight-black');
    expect(useConfiguratorStore.getState().configuration.exteriorColor).toBe('midnight-black');
    expect(useConfiguratorStore.getState().viewMode).toBe('exterior');

    useConfiguratorStore.getState().setInteriorColor('deep-blue');
    expect(useConfiguratorStore.getState().configuration.interiorColor).toBe('deep-blue');
    expect(useConfiguratorStore.getState().viewMode).toBe('interior');

    useConfiguratorStore.getState().setWheelType('sport');
    expect(useConfiguratorStore.getState().configuration.wheelType).toBe('sport');
  });
});
