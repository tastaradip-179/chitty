import { combineReducers } from "redux";

const initialstate = {
    current_friend_id: null
}
const initialstate2 = {
    current_group_id: null
}


const currentFriendReducer = (state=initialstate, action) => {
    if(action.type === "CURRENT_FRIEND"){
        return {...state, current_friend_id: action.payload}
    }
    else{
        return state
    }
}
const currentGroupReducer = (state=initialstate2, action) => {
    if(action.type === "CURRENT_GROUP"){
        return {...state, current_group_id: action.payload}
    }
    else{
        return state
    }
}


const rootReducer = combineReducers({
    currentFriend: currentFriendReducer,
    currentGroup: currentGroupReducer
})

export default rootReducer;