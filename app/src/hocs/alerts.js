/**
 * @author Dmitriy Bizyaev
 */

import React from 'react';

let alertArea = null;
let nextAlertId = 0;

const createAlert = alert => {
  if (alertArea) alertArea.addToQueue({ ...alert, id: String(nextAlertId++) });
};

const alertAreaReady = alertAreaRef => {
  alertArea = alertAreaRef;
};

const alertAreaRemoved = () => {
  alertArea = null;
};

export const alertAreaProvider = WrappedComponent => {
  const ret = props => (
    <WrappedComponent
      {...props}
      onAlertAreaReady={alertAreaReady}
      onAlertAreaRemoved={alertAreaRemoved}
    />
  );
  
  ret.displayName = `alertAreaProvider(${WrappedComponent.displayName})`;
  
  return ret;
};

export const alertsCreator = WrappedComponent => {
  const ret = props => (
    <WrappedComponent {...props} onAlert={createAlert} />
  );
  
  ret.displayName = `alertsCreator(${WrappedComponent.displayName})`;
  
  return ret;
};
