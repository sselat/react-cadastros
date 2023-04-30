import {BrowserRouter} from 'react-router-dom'
import RoutesApp from './Routes/'
import {ToastContainer} from 'react-toastify'

import 'react-toastify/dist/ReactToastify.css'
export default function App() {
  return (
    <div>
      <ToastContainer />
      <BrowserRouter>
        <RoutesApp />
      </BrowserRouter>
    </div>
  )
}
