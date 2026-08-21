import { initDirectoryModule } from '../modules/directory';
import { initFinanceModule } from '../modules/finance';
import { initKoperasiModule } from '../modules/koperasi';
import { initFundingModule } from '../modules/funding';
import { initMarketplaceModule } from '../modules/marketplace';
import { initPOSModule } from '../modules/pos';
import { initSocialModule } from '../modules/social';
import { initLearningModule } from '../modules/learning';

export function initializeModules() {
  console.log('[Core] Initializing Modules...');
  initDirectoryModule();
  initFinanceModule();
  initKoperasiModule();
  initFundingModule();
  initMarketplaceModule();
  initPOSModule();
  initSocialModule();
  initLearningModule();
  // Add other modules here as they are refactored
}
