import { BrowserRouter, Routes, Route } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/common.css';
import Signinup from "./components/Signinup";
import Profile from "./components/Profile";
import Users from "./components/Users";
import RequestsSent from "./components/RequestsSent";
import RequestsPending from "./components/RequestsPending";
import Friends from "./components/Friends";
import Strangers from "./components/Strangers";
import GroupCreate from "./components/GroupCreate";
import Groups from "./components/Groups";
import Messages from "./components/Messages";
import GroupMessages from "./components/GroupMessages";


function App() {
  return (
    <BrowserRouter>
      <Routes>
          <Route path="/" element={<Profile/>} />
          <Route path="/signinup" element={<Signinup/>} />
          <Route path="/all-users" element={<Users/>}/>
          <Route path="/request-sent-to-users" element={<RequestsSent/>}/>
          <Route path="/requests-pending" element={<RequestsPending/>}/>
          <Route path="/friends" element={<Friends/>}/>
          <Route path="/strangers" element={<Strangers/>}/>
          <Route path="/group-create" element={<GroupCreate/>}/>
          <Route path="/groups" element={<Groups/>}/>
          <Route path="/my-messages" element={<Messages/>}/>
          <Route path="/group-messages" element={<GroupMessages/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
