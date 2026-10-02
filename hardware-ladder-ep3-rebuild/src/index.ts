// setup must be the first import: it binds this project's data to @video/kit before anything reads it.
import './setup';
import {registerRoot} from 'remotion';
import {Root} from './Root';

registerRoot(Root);
