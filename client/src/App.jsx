import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';



import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';



import Header from './components/Header.jsx';
import Home from './components/Home.jsx';
import Budget from './components/Budget.jsx';
import Proposals from './components/Proposals.jsx';
import Voting from './components/Voting.jsx';
import Results from './components/Results.jsx';
import Auth from './components/Auth.jsx';
import API from './API.mjs';
import { useNavigate } from 'react-router-dom';



function App() {

  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [project, setProject] = useState({
    phase: 0, amount: 0
  });



  const handleLogout = async () => {
    await API.logout().then(() => {
      API.getCurrentUser().then(response => {
        if (response) {
          setUser(response)
        } else {
          setUser(null)
        }
      })
      API.getCurrentPhase().then(response => {
          setProject.phase(response)
      })
    })
    setUser(null)
  };

  const login = async (username, password) => {
    await API.Login(username, password).then(response => {
      setLoggedIn(true); setUser(response);
      navigate('/');
    })


  }

  const getCurrentProject = () => {
    API.getBudget().then(response => {
      if (response) {
        setProject(response)
      } else {
        setProject({
          phase: 0,
          amount: null
        })
      }
    })
  }
  const getUser = () => {
    API.getCurrentUser().then(response => {
      if (response) {
        setUser(response)
      } else {
        setUser(null)
      }
    })
  }

  useEffect(() => {

    getUser()

    getCurrentProject();



  }, [])



  return (
    <>
      <Header handleLogout={handleLogout} user={user} />
      <div className="container mt-4">
        <Routes>
          {user ?
            <Route path='/' element={<div>
              {project.phase == 0 && <Budget user={user} getCurrentProject={getCurrentProject} />}
              {project.phase == 1 && <Proposals user={user} getCurrentProject={getCurrentProject} project={project} />}
              {project.phase == 2 && <Voting user={user} getCurrentProject={getCurrentProject} project={project} />}
              {project.phase == 3 && <Results user={user} getCurrentProject={getCurrentProject} project={project} />}
            </div>
            } />
            : <Route path="/" element={<Home user={user} project={project} />} />
          }

          <Route path="/login" element={<Auth login={login} />} />
        </Routes>
      </div>
    </>
  );
}

export default App
