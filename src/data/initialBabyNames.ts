import { BabyName } from '../types';
import { BOY_NAMES } from './namesBoy';
import { GIRL_NAMES } from './namesGirl';

export const INITIAL_BABY_NAMES: BabyName[] = [
  ...BOY_NAMES,
  ...GIRL_NAMES
];
