'use strict';

/* Size */
export const baseModule = ({ theme }) => theme.baseModule;
export const halfBaseModule = ({ theme }) => theme.baseModule / 2;
export const quarterBaseModule = ({ theme }) => theme.baseModule / 4;
export const oneAndHalfBaseModule = ({ theme }) => theme.baseModule * 1.5;
export const doubleBaseModule = ({ theme }) => theme.baseModule * 2;

export const radiusDefault = ({ theme }) => theme.radiusDefault;
export const radiusRounded = ({ theme }) => theme.radiusRounded;

/* Color */
export const colorWhite = ({ theme }) => theme.white;
export const colorBlack = ({ theme }) => theme.black;
export const colorTransparent = ({ theme }) => theme.transparent;

export const colorMain = ({ theme }) => theme.main;
export const colorMainForeground = ({ theme }) => theme.mainFgTextColor;
export const colorSecondary = ({ theme }) => theme.secondary;
export const colorSecondaryForeground = ({ theme }) =>
  theme.secondaryFgTextColor;
export const colorAlert = ({ theme }) => theme.alert;
export const colorAlertForeground = ({ theme }) => theme.alertFgTextColor;
export const colorWarning = ({ theme }) => theme.warning;
export const colorWarningForeground = ({ theme }) => theme.warningFgTextColor;
export const colorError = ({ theme }) => theme.alert;
export const colorErrorForeground = ({ theme }) => theme.alertFgTextColor;
export const colorSuccess = ({ theme }) => theme.success;
export const colorSuccessForeground = ({ theme }) => theme.successFgTextColor;
export const colorInfo = ({ theme }) => theme.info;
export const colorInfoForeground = ({ theme }) => theme.infoFgTextColor;

export const paletteBlueGrey50 = ({ theme }) => theme.paletteBlueGrey[50];
export const paletteBlueGrey75 = ({ theme }) => theme.paletteBlueGrey[75];
export const paletteBlueGrey100 = ({ theme }) => theme.paletteBlueGrey[100];
export const paletteBlueGrey200 = ({ theme }) => theme.paletteBlueGrey[200];
export const paletteBlueGrey300 = ({ theme }) => theme.paletteBlueGrey[300];
export const paletteBlueGrey400 = ({ theme }) => theme.paletteBlueGrey[400];
export const paletteBlueGrey500 = ({ theme }) => theme.paletteBlueGrey[500];
export const paletteBlueGrey600 = ({ theme }) => theme.paletteBlueGrey[600];
export const paletteBlueGrey700 = ({ theme }) => theme.paletteBlueGrey[700];
export const paletteBlueGrey800 = ({ theme }) => theme.paletteBlueGrey[800];
export const paletteBlueGrey900 = ({ theme }) => theme.paletteBlueGrey[900];

/* Font size */
export const fontSizeXSmall = ({ theme }) => theme.fontSize[-2];
export const fontSizeSmall = ({ theme }) => theme.fontSize[-1];
export const fontSizeBody = ({ theme }) => theme.fontSize[0];
export const fontSizeBody2 = ({ theme }) => theme.fontSize[1];
export const fontSizeTitle = ({ theme }) => theme.fontSize[2];
export const fontSizeHeadline = ({ theme }) => theme.fontSize[3];
export const fontSizeDisplay1 = ({ theme }) => theme.fontSize[4];
export const fontSizeDisplay2 = ({ theme }) => theme.fontSize[5];
export const fontSizeDisplay3 = ({ theme }) => theme.fontSize[6];
export const fontSizeDisplay4 = ({ theme }) => theme.fontSize[7];

/* Font weight */
export const fontWeightLight = ({ theme }) => theme.fontWeight.light;
export const fontWeightNormal = ({ theme }) => theme.fontWeight.normal;
export const fontWeightSemibold = ({ theme }) => theme.fontWeight.semibold;
export const fontWeightBold = ({ theme }) => theme.fontWeight.bold;

/* Text color */
export const textColorMedium = paletteBlueGrey400;
export const textColorBody = paletteBlueGrey900;
