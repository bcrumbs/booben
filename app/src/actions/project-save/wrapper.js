import {
  PROJECT_SAVE,
  PROJECT_SAVE_SUCCESS,
  PROJECT_SAVE_ERROR,
} from './actions';

import { projectToJSv1 } from '../../models/Project';
import { isProjectDirty } from '../../selectors';
import { putProject } from '../../lib/api';

const PROJECT_SAVE_DEBOUNCE = 2000;

let saveTimeout = 0;
let repeat = false;

const clearSaveTimeout = () => {
  clearTimeout(saveTimeout);
  saveTimeout = 0;
};

const doSave = async (dispatch, getState) => {
  saveTimeout = 0;
  
  if (!isProjectDirty(getState())) return;
  
  dispatch({ type: PROJECT_SAVE });
  
  const state = getState();
  const projectName = state.project.projectName;
  
  const project = state.project.data;
  const jsProject = projectToJSv1(project);

  try {
    if (process.env.NODE_ENV === 'demo') 
      throw new Error('Saving is deactivated in demo')
    await putProject(projectName, jsProject);
    dispatch({ type: PROJECT_SAVE_SUCCESS });
  } catch (error) {
    dispatch({ type: PROJECT_SAVE_ERROR, error });
  }
  
  if (repeat) {
    repeat = false;
    await doSave(dispatch, getState);
  }
};

const triggerSave = (dispatch, getState) => {
  if (getState().project.saving) {
    repeat = true;
  } else {
    if (saveTimeout) clearSaveTimeout();
    saveTimeout = setTimeout(doSave, PROJECT_SAVE_DEBOUNCE, dispatch, getState);
  }
};

export default actionCreator => (...args) => (dispatch, getState) => {
  dispatch(actionCreator(...args));
  triggerSave(dispatch, getState);
};
