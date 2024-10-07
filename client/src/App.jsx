import {BrowserRouter as Router,Routes,Route } from 'react-router-dom'
import Register from './pages/register';
import Login from './pages/Login';
import Dashboard from './pages/dashboard';




function App() {

  return (
    <Router>
     <Routes>
      <Route path='/register' Component={Register} />
      <Route path='/login' Component={Login}/>
      <Route path='/dashboard' Component={Dashboard}/>
     </Routes>
    </Router>
  )
}

export default App
