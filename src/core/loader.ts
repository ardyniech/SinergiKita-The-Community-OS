import { initDirectoryModule } from '../modules/directory';
import { initFinanceModule } from '../modules/finance';
import { initKoperasiModule } from '../modules/koperasi';
import { initFundingModule } from '../modules/funding';
import { initMarketplaceModule } from '../modules/marketplace';
import { initPOSModule } from '../modules/pos';
import { initSocialModule } from '../modules/social';
import { initLearningModule } from '../modules/learning';
import { initReportingModule } from '../modules/reporting';
import { initInventoryModule } from '../modules/inventory';
import { initVotingModule } from '../modules/voting';

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
  initReportingModule();
  initInventoryModule();
  initVotingModule();
}
