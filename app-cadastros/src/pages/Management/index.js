import {auth} from '../../services/FirebaseServices'
import {signOut} from 'firebase/auth'

import {Button} from 'primereact/button'
import {CustomersDatatable} from '../../components/Management/Datatable'
import {Avatar} from 'primereact/avatar'

import './management.css'

export default function Management() {
  const dataTableStyle = {
    marginLeft: '200px'
  }
  async function handleLogout() {
    await signOut(auth).then(() => {
      localStorage.clear()
    })
  }
  return (
    <div className="container">
      <div className="sideBar flex flex-column align-items-center gap-3 pt-8">
        <h2>Provider IT</h2>
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
        <p>tales@teste.com</p>
        <Button
          className="transition-all transition-duration-300 mt-8 hover:bg-red-500 hover:border-red-900"
          severity="primary"
          label="Sair"
          onClick={handleLogout}
        />
      </div>
      <CustomersDatatable style={dataTableStyle} />
    </div>
  )
}
