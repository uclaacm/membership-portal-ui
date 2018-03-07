import Immutable from 'immutable';

/**********************************************
 ** Constants                                **
 *********************************************/

const CREATE_MILESTONE = Symbol();
const CREATE_MILESTONE_ERR = Symbol();

const CREATE_MILESTONE_DONE = Symbol();

const defaultState = Immutable.fromJS({
  created: false,
  createSuccess: false,
	error: null,
});

/**********************************************
 ** Check In States                          **
 *********************************************/
class State {
  static Create(error){
    return {
      type   : error ? CREATE_MILESTONE_ERR : CREATE_MILESTONE,
      error  : error || undefined,
    }
  }
}

 /**********************************************
  ** Actions                                  **
  *********************************************/

const CreateMilestone = name =>{
  return async (dispatch) => {
    try{
      const response = await fetch("/app/api/v1/user/milestone", {
        method: 'POST',
        body: JSON.stringify({
          milestone: {
            name: name,
            resetPoints: true
          }
        }),
      });

      const status = await response.status;
      const data = await response.json();

      if (data.error)
        throw new Error(data.error.message);

      dispatch(State.Create());
    }catch(err){
      dispatch(State.Create(err));
    }
  };
}

  /**********************************************
   ** Milestone Reducer                        **
   *********************************************/
const Milestone = (state=defaultState, action) => {
  switch(action.type) {
    case CREATE_MILESTONE:
      return state.withMutations(val => {
        val.set('error', null);
        val.set('createSuccess', true);
        val.set('created', true);
      });

    case CREATE_MILESTONE_ERR:
      return state.withMutations(val => {
        val.set('error', action.error);
        val.set('createSuccess', false);
        val.set('created', true);
      });

    case CREATE_MILESTONE_DONE:
      return state.withMutations(val => {
        val.set('error', null);
        val.set('createSuccess', false);
        val.set('created', false);
      });

    default:
      return state;
  }
}

const CreateMilestoneDone = () => ({ type: CREATE_MILESTONE_DONE});
export{
  Milestone, CreateMilestone, CreateMilestoneDone
}
