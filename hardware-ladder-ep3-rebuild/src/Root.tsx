import React from 'react';
import {Composition} from 'remotion';
import {Opening} from './v3/opening';
export const Root: React.FC=()=> <>
 <Composition id="Main" component={Opening} durationInFrames={1051} fps={25} width={1080} height={1920} defaultProps={{full:true}}/>
 <Composition id="Opening10" component={Opening} durationInFrames={250} fps={25} width={1080} height={1920} defaultProps={{full:false}}/>
</>;
