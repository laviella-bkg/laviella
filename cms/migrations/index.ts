import * as migration_20261015_135619_initial from './20261015_135619_initial';

export const migrations = [
  {
    up: migration_20261015_135619_initial.up,
    down: migration_20261015_135619_initial.down,
    name: '20261015_135619_initial'
  },
];
