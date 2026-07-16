import React, { createContext, useContext, useMemo } from 'react';

export const USE_MOCK_PREMIUM = false;
export const SUBSCRIPTION_SKU_MONTHLY = 'tasneem_premium_monthly';

const PremiumContext = createContext(null);

const FreeAndroidProvider = ({ children }) => {
  const value = useMemo(() => ({
    isPremium: true,
    premiumChecking: false,
    iapReady: true,
    paywallVisible: false,
    showPaywall: () => { },
    hidePaywall: () => { },
    requirePremium: (action) => action(),
    purchaseSubscription: async () => { },
    restorePurchases: async () => { },
    toggleMockPremium: () => { },
    iapLoading: false,
  }), []);

  return (
    <PremiumContext.Provider value={value}>
      {children}
    </PremiumContext.Provider>
  );
};

export const PremiumProvider = ({ children }) => {
  return <FreeAndroidProvider>{children}</FreeAndroidProvider>;
};

const usePremium = () => {
  const context = useContext(PremiumContext);
  if (!context) {
    throw new Error('usePremium must be used within a PremiumProvider');
  }
  return context;
};

export default usePremium;
