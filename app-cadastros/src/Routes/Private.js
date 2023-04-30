import {useEffect, useState} from 'react'
import {auth} from '../services/FirebaseServices'
import {onAuthStateChanged} from 'firebase/auth'
import {Navigate} from 'react-router-dom'

export default function Private({children}) {
  const [loading, setLoading] = useState(true)
  const [signed, setSigned] = useState(false)

  useEffect(() => {
    async function checkLogin() {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          const userData = {
            uid: user.uid,
            email: user.email,
            name: user.name
          }

          localStorage.setItem('@activeUser', JSON.stringify(userData))

          setLoading(false)
          setSigned(true)
        } else {
          setLoading(false)
          setSigned(false)
        }
      })
    }
    checkLogin()
  }, [])

  if (loading) {
    return <div></div>
  }

  if (!signed) {
    return <Navigate to="/" />
  }
  return children
}
