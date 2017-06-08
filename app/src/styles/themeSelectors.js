'use strict';

/* Size */
export const baseModule = ({ theme }) => theme.jssy.baseModule;
export const halfBaseModule = ({ theme }) => theme.jssy.baseModule / 2;
export const quarterBaseModule = ({ theme }) => theme.jssy.baseModule / 4;
export const threeHalvesBaseModule = ({ theme }) => theme.jssy.baseModule * 1.5;
export const doubleBaseModule = ({ theme }) => theme.jssy.baseModule * 2;

export const radiusDefault = ({ theme }) => theme.jssy.radiusDefault;
export const radiusRounded = ({ theme }) => theme.jssy.radiusRounded;

/* Color */
export const colorWhite = ({ theme }) => theme.jssy.color.white;
export const colorBlack = ({ theme }) => theme.jssy.color.black;
export const colorTransparent = ({ theme }) => theme.jssy.color.transparent;

export const colorMain = ({ theme }) =>
  theme.jssy.color.main;
export const colorMainForeground = ({ theme }) =>
  theme.jssy.color.mainFgTextColor;
export const colorSecondary = ({ theme }) =>
  theme.jssy.color.secondary;
export const colorSecondaryForeground = ({ theme }) =>
  theme.jssy.color.secondaryFgTextColor;
export const colorAlert = ({ theme }) =>
  theme.jssy.color.alert;
export const colorAlertForeground = ({ theme }) =>
  theme.jssy.color.alertFgTextColor;
export const colorWarning = ({ theme }) =>
  theme.jssy.color.warning;
export const colorWarningForeground = ({ theme }) =>
  theme.jssy.color.warningFgTextColor;
export const colorError = ({ theme }) =>
  theme.jssy.color.alert;
export const colorErrorForeground = ({ theme }) =>
  theme.jssy.color.alertFgTextColor;
export const colorSuccess = ({ theme }) =>
  theme.jssy.color.success;
export const colorSuccessForeground = ({ theme }) =>
  theme.jssy.color.successFgTextColor;
export const colorInfo = ({ theme }) =>
  theme.jssy.color.info;
export const colorInfoForeground = ({ theme }) =>
  theme.jssy.color.infoFgTextColor;

export const paletteBlueGrey50 = ({ theme }) =>
  theme.jssy.paletteBlueGrey[50];
export const paletteBlueGrey75 = ({ theme }) =>
  theme.jssy.paletteBlueGrey[75];
export const paletteBlueGrey100 = ({ theme }) =>
  theme.jssy.paletteBlueGrey[100];
export const paletteBlueGrey200 = ({ theme }) =>
  theme.jssy.paletteBlueGrey[200];
export const paletteBlueGrey300 = ({ theme }) =>
  theme.jssy.paletteBlueGrey[300];
export const paletteBlueGrey400 = ({ theme }) =>
  theme.jssy.paletteBlueGrey[400];
export const paletteBlueGrey500 = ({ theme }) =>
  theme.jssy.paletteBlueGrey[500];
export const paletteBlueGrey600 = ({ theme }) =>
  theme.jssy.paletteBlueGrey[600];
export const paletteBlueGrey700 = ({ theme }) =>
  theme.jssy.paletteBlueGrey[700];
export const paletteBlueGrey800 = ({ theme }) =>
  theme.jssy.paletteBlueGrey[800];
export const paletteBlueGrey900 = ({ theme }) =>
  theme.jssy.paletteBlueGrey[900];

/* Font size */
export const fontSizeXSmall = ({ theme }) => theme.jssy.fontSize[-2];
export const fontSizeSmall = ({ theme }) => theme.jssy.fontSize[-1];
export const fontSizeBody = ({ theme }) => theme.jssy.fontSize[0];
export const fontSizeBody2 = ({ theme }) => theme.jssy.fontSize[1];
export const fontSizeTitle = ({ theme }) => theme.jssy.fontSize[2];
export const fontSizeHeadline = ({ theme }) => theme.jssy.fontSize[3];
export const fontSizeDisplay1 = ({ theme }) => theme.jssy.fontSize[4];
export const fontSizeDisplay2 = ({ theme }) => theme.jssy.fontSize[5];
export const fontSizeDisplay3 = ({ theme }) => theme.jssy.fontSize[6];
export const fontSizeDisplay4 = ({ theme }) => theme.jssy.fontSize[7];

/* Font weight */
export const fontWeightLight = ({ theme }) => theme.jssy.fontWeight.light;
export const fontWeightNormal = ({ theme }) => theme.jssy.fontWeight.normal;
export const fontWeightSemibold = ({ theme }) => theme.jssy.fontWeight.semibold;
export const fontWeightBold = ({ theme }) => theme.jssy.fontWeight.bold;

/* Text color */
export const textColorMedium = paletteBlueGrey400;
export const textColorBody = paletteBlueGrey900;
