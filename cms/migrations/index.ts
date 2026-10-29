import * as migration_20261015_135619_initial from './20261015_135619_initial';
import * as migration_20261029_150959_domos_tarifas from './20261029_150959_domos_tarifas';

export const migrations = [
  {
    up: migration_20261015_135619_initial.up,
    down: migration_20261015_135619_initial.down,
    name: '20261015_135619_initial',
  },
  {
    up: migration_20261029_150959_domos_tarifas.up,
    down: migration_20261029_150959_domos_tarifas.down,
    name: '20261029_150959_domos_tarifas'
  },
];
