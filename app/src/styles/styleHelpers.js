import { jssyTheme } from './theme';

export const baseModule = ({ baseModule = jssyTheme.baseModule }) => baseModule;

export const quaterBaseModule = ({
  baseModule = jssyTheme.baseModule,
}) => baseModule / 4;

export const halfBaseModule = ({
  baseModule = jssyTheme.baseModule,
}) => baseModule / 2;

export const twoBaseModule = ({
  baseModule = jssyTheme.baseModule,
}) => baseModule * 2;

/** Color */
export const colorPaletteBlueGrey50 = ({
  paletteBlueGrey = jssyTheme.paletteBlueGrey,
}) => paletteBlueGrey[50];

export const colorPaletteBlueGrey75 = ({
  paletteBlueGrey = jssyTheme.paletteBlueGrey,
}) => paletteBlueGrey[75];

export const colorPaletteBlueGrey100 = ({
  paletteBlueGrey = jssyTheme.paletteBlueGrey,
}) => paletteBlueGrey[100];

export const colorPaletteBlueGrey200 = ({
  paletteBlueGrey = jssyTheme.paletteBlueGrey,
}) => paletteBlueGrey[200];

export const colorPaletteBlueGrey300 = ({
  paletteBlueGrey = jssyTheme.paletteBlueGrey,
}) => paletteBlueGrey[300];

export const colorPaletteBlueGrey400 = ({
  paletteBlueGrey = jssyTheme.paletteBlueGrey,
}) => paletteBlueGrey[400];

export const colorPaletteBlueGrey500 = ({
  paletteBlueGrey = jssyTheme.paletteBlueGrey,
}) => paletteBlueGrey[500];

export const colorPaletteBlueGrey600 = ({
  paletteBlueGrey = jssyTheme.paletteBlueGrey,
}) => paletteBlueGrey[600];

export const colorPaletteBlueGrey700 = ({
  paletteBlueGrey = jssyTheme.paletteBlueGrey,
}) => paletteBlueGrey[700];

export const colorPaletteBlueGrey800 = ({
  paletteBlueGrey = jssyTheme.paletteBlueGrey,
}) => paletteBlueGrey[800];

export const colorPaletteBlueGrey900 = ({
  paletteBlueGrey = jssyTheme.paletteBlueGrey,
}) => paletteBlueGrey[900];

/** Text */
export const fontSizeXsmall = ({ fontSize = jssyTheme.fontSize }) =>
  fontSize[-2];
export const fontSizeSmall = ({ fontSize = jssyTheme.fontSize }) =>
  fontSize[-1];
export const fontSizeBody = ({ fontSize = jssyTheme.fontSize }) =>
  fontSize[0];
export const fontSizeBody2 = ({ fontSize = jssyTheme.fontSize }) =>
  fontSize[1];
export const fontSizeTitle = ({ fontSize = jssyTheme.fontSize }) =>
  fontSize[2];
export const fontSizeHeadline = ({ fontSize = jssyTheme.fontSize }) =>
  fontSize[3];
export const fontSizeDisplay1 = ({ fontSize = jssyTheme.fontSize }) =>
  fontSize[4];
export const fontSizeDisplay2 = ({ fontSize = jssyTheme.fontSize }) =>
  fontSize[5];
export const fontSizeDisplay3 = ({ fontSize = jssyTheme.fontSize }) =>
  fontSize[6];
export const fontSizeDisplay4 = ({ fontSize = jssyTheme.fontSize }) =>
  fontSize[7];

export const fontWeightLight = ({ fontWeight = jssyTheme.fontWeight }) =>
  fontWeight.light;
export const fontWeightNormal = ({ fontWeight = jssyTheme.fontWeight }) =>
  fontWeight.normal;
export const fontWeightSemibold = ({ fontWeight = jssyTheme.fontWeight }) =>
  fontWeight.semibold;
export const fontWeightBold = ({ fontWeight = jssyTheme.fontWeight }) =>
  fontWeight.bold;

export const fontColorMedium = ({
  paletteBlueGrey = jssyTheme.paletteBlueGrey,
}) => paletteBlueGrey[400];

