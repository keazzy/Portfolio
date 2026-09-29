import { company, shot } from './company';
import { home, projectsSection, sayHelloSection, workSection } from './home';
import { imageFrame, videoFrame } from './media';
import { settings } from './settings';

export const schemaTypes = [settings, home, workSection, projectsSection, sayHelloSection, company, shot, imageFrame, videoFrame];

/** Documents that exist exactly once and can't be created, duplicated or deleted from the Studio. */
export const SINGLETONS = ['settings', 'home'];
