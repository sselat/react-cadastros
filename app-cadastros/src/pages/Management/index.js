import {auth} from '../../services/FirebaseServices'
import {signOut} from 'firebase/auth'

import {Button} from 'primereact/button'
import {CustomersDatatable} from '../../components/Management/Datatable'
import {Avatar} from 'primereact/avatar'

import './management.css'
import {useEffect, useState} from 'react'

export default function Management() {
  const [showSideBar, setShowSideBar] = useState(false)
  const [user, setUser] = useState({})

  useEffect(() => {
    const userDetail = localStorage.getItem('@activeUser')
    setUser(JSON.parse(userDetail))
  }, [])

  const dataTableStyle = {
    transition: '.5s all',
    marginLeft: '200px'
  }
  async function handleLogout() {
    await signOut(auth).then(() => {
      localStorage.clear()
    })
  }
  const openedSideBar = () => {
    return (
      <div className="sideBar opened flex flex-column align-items-center gap-3 transition-all transition-duration-500">
        <Button
          className="absolut top-0 w-12"
          icon="pi pi-caret-left"
          iconPos="right"
          severity="info"
          raised
          onClick={() => setShowSideBar(false)}
        />
        <h2 className="mt-8">Provider IT</h2>
        <Avatar
          icon="pi pi-user"
          size="xlarge"
          style={{
            border: '1px solid var(--primary-color)',
            borderRadius: '50%',
            width: '8rem',
            height: '8rem'
          }}
        />
        <p>{user.email}</p>
        <Button
          className="transition-all transition-duration-300 mt-8 hover:bg-red-500 hover:border-red-900"
          severity="primary"
          label="Sair"
          onClick={handleLogout}
        />
      </div>
    )
  }
  const closedSideBar = () => {
    return (
      <div className="sideBar closed transition-all transition-duration-500 flex flex-column align-items-center">
        <Button
          icon="pi pi-caret-right"
          severity="info"
          raised
          style={{
            maxWidth: '50px'
          }}
          onClick={() => setShowSideBar(true)}
        />
        <Button
          className="transition-all transition-duration-300 mt-8 hover:bg-red-500 hover:border-red-900"
          severity="primary"
          icon="pi pi-sign-out"
          onClick={handleLogout}
        />
      </div>
    )
  }
  return (
    <div className="container">
      {showSideBar ? openedSideBar() : closedSideBar()}
      <CustomersDatatable
        user={user}
        style={
          showSideBar
            ? dataTableStyle
            : {marginLeft: '50px', transition: '.5s all'}
        }
      />
    </div>
  )
}
