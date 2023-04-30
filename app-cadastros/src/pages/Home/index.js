import {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {auth} from '../../services/FirebaseServices'
import {signInWithEmailAndPassword} from 'firebase/auth'

//primeReact imports
import {Card} from 'primereact/card'
import {Button} from 'primereact/button'
import {InputText} from 'primereact/inputtext'

//util imports
import {toast} from 'react-toastify'

export default function Home() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [validField, setValidField] = useState(true)

  const navigate = useNavigate()

  async function handleLogin() {
    if (email !== '' && password !== '') {
      await signInWithEmailAndPassword(auth, email, password)
        .then(() => {
          toast.success('Logado com sucesso!')
          navigate('/admin', {replace: true})
        })
        .catch(() => {
          setValidField(false)
          toast.error(`Usuário ou senha inválidos!`)
        })
    }
  }

  const goToRegister = () => {
    navigate('/register', {replace: true})
  }
  const header = (
    <img
      alt="Card"
      src="/mini-wallpaper.jpg"
      style={{borderTopRightRadius: '6px', borderTopLeftRadius: '6px'}}
    />
  )
  const footer = (
    <div className="flex justify-content-center">
      <Button
        className="flex-grow-1"
        label="Entrar"
        severity="primary"
        onClick={handleLogin}
      />
    </div>
  )
  return (
    <div
      className="flex flex-column justify-content-center align-items-center gap-2"
      style={{height: '100vh'}}
    >
      <Card
        title="Entrar no sistema"
        footer={footer}
        header={header}
        className="md:w-25rem"
      >
        <div className="flex flex-column gap-2">
          <div className="p-inputgroup">
            <span
              className="p-inputgroup-addon"
              style={{backgroundColor: 'var(--highlight-bg'}}
            >
              <i
                className="pi pi-envelope"
                style={{
                  color: 'var(--primary-color)'
                }}
              ></i>
            </span>
            <InputText
              className={validField ? '' : 'p-invalid'}
              placeholder="Digite o seu email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setValidField(true)
              }}
            />
          </div>
          <div className="p-inputgroup">
            <span
              className="p-inputgroup-addon"
              style={{backgroundColor: 'var(--highlight-bg'}}
            >
              <i
                className="pi pi-lock"
                style={{
                  color: 'var(--primary-color)'
                }}
              ></i>
            </span>
            <InputText
              className={validField ? '' : 'p-invalid'}
              placeholder="Digite a sua senha"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setValidField(true)
              }}
              required
            />
          </div>
        </div>
      </Card>
      <Button
        // onClick={navigate('/register', {replace: true})}
        onClick={goToRegister}
        text
      >
        Criar uma nova conta
      </Button>
    </div>
  )
}
