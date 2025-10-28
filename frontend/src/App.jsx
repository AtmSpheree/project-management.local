import { useContext, useEffect, useState } from 'react'
import './App.css'
import { Route, Routes, useNavigate } from 'react-router'
import Header from './components/Header/Header'
import Login from './components/Login/Login'
import Profile from './components/Profile/Profile'
import { DataContext } from './context/dataContext'
import Users from './components/Users/Users'
import AddUser from './components/AddUser/AddUser'
import AddProject from './components/AddProject/AddProject'
import Projects from './components/Projects/Projects'
import Tasks from './components/Tasks/Tasks'
import AddTask from './components/AddTask/AddTask'
import Contractors from './components/Contractors/Contractors'
import AddContractor from './components/AddContractor/AddContractor'
import OwnTasks from './components/OwnTasks/OwnTasks'
import ChangeStatus from './components/ChangeStatus/ChangeStatus'

function App() {
  const navigator = useNavigate();
  const dataContext = useContext(DataContext);

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', dataContext.data?.theme)
  }, [dataContext.data?.theme])

  async function getProfile() {
    if (localStorage.getItem('token') !== null && localStorage.getItem('token') !== undefined) {
      try {
        let data = await fetch(`${import.meta.env.VITE_API_URL}/profile`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (data.status === 401) {
          localStorage.removeItem('token');
          dataContext.setData({
            ...dataContext.data,
            profile: null
          });
        } else {
          let response = await data.json();
          dataContext.setData({
            ...dataContext.data,
            profile: {
              ...response.data,
              patronymic: response.data.patronymic === null ? "" : response.data.patronymic
            }
          })
        }
      } catch (e) {

      }
    } else {
      dataContext.setData({
        ...dataContext.data,
        profile: null
      })
    }
  }

  return (
    <Routes>
      <Route element={<Header getProfile={getProfile}/>}>
        <Route path='/login' element={<Login getProfile={getProfile}/>}/>
        <Route path='/profile' element={<Profile/>}/>
        <Route path='/users' element={<Users/>}/>
        <Route path='/add_user' element={<AddUser/>}/>
        <Route path='/users/:userId' element={<AddUser/>}/>
        <Route path='/' element={<Projects/>}/>
        <Route path='/add_project' element={<AddProject/>}/>
        <Route path='/projects/:projectId' element={<AddProject/>}/>
        <Route path='/projects/:projectId/tasks' element={<Tasks/>}/>
        <Route path='/projects/:projectId/add_task' element={<AddTask/>}/>
        <Route path='/tasks/:taskId' element={<AddTask/>}/>
        <Route path='/contractors/:taskId' element={<Contractors/>}/>
        <Route path='/contractors/:taskId/add_contractor' element={<AddContractor/>}/>
        <Route path='/own_tasks' element={<OwnTasks/>}/>
        <Route path='/change_status/:taskId' element={<ChangeStatus/>}/>
      </Route>
    </Routes>
  )
}

export default App
