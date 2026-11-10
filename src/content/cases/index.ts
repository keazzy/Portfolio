import type { CaseStudy } from '@/lib/work/case';
import { mobile } from './mobile';
import { pulse } from './pulse';
import { stocks } from './stocks';
import { vest } from './vest';

/** Case studies by `company/shot`, the same key a shot's viewer link uses. */
export const CASES: Record<string, CaseStudy> = {
  'halvest/vest': vest,
  'halvest/mobile': mobile,
  'halvest/stocks': stocks,
  'impulse/pulse-search': pulse,
};
