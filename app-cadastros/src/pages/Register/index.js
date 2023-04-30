import {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {auth} from '../../services/FirebaseServices'
import {createUserWithEmailAndPassword} from 'firebase/auth'

import {InputText} from 'primereact/inputtext'
import {Card} from 'primereact/card'
import {Button} from 'primereact/button'

import {toast} from 'react-toastify'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [isValidPassword, setIsValidPassword] = useState(true)
  const [isValidEmail, setIsValidEmail] = useState(true)

  const navigate = useNavigate()

  async function handleRegister(e) {
    e.preventDefault()
    if (!validateEmail()) {
      return
    }
    if (!validatePassword()) {
      return
    }

    if (isValidEmail && isValidPassword) {
      await createUserWithEmailAndPassword(auth, email, password)
        .then(() => {
          toast.success('Cadastro criado com sucesso!')
          navigate('/admin', {replace: true})
        })
        .catch(() => toast.error('Erro ao cadastrar!'))
    } else {
      toast.warn('Preencha corretamente todos os campos!')
    }
  }

  const validateEmail = () => {
    if (email === '') {
      toast.warn('Digite um endereço de e-mail!')
      setIsValidEmail(false)
      return false
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email)) {
      setIsValidEmail(false)
      toast.error('O e-mail digitado é inválido!')
      return false
    } else {
      setIsValidEmail(true)
      return true
    }
  }
  const validatePassword = () => {
    if (password.length < 6) {
      setIsValidPassword(false)
      toast.error('Mínimo de 6 caracteres!')
      return false
    } else if (password !== passwordConfirmation) {
      setIsValidPassword(false)
      toast.error('As senhas digitadas não correspondem!')
      return false
    } else {
      return true
    }
  }

  const backToHome = () => {
    navigate('/', {replace: true})
  }
  const footer = (
    <div className="flex justify-content-between gap-2">
      <Button
        label="Voltar"
        severity="danger"
        text
        onClick={backToHome}
      />
      <Button
        label="Registrar"
        severity="primary"
        onClick={handleRegister}
      />
    </div>
  )
  return (
    <div
      className="flex flex-column justify-content-center align-items-center gap-2"
      style={{height: '100vh'}}
    >
      <Card
        title="Novo usuário"
        footer={footer}
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
              className={isValidEmail ? '' : 'p-invalid'}
              placeholder="Digite o seu email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setIsValidEmail(true)
              }}
            />
          </div>
          <br />
          <br />
          <div className="p-inputgroup">
            <span
              className="p-inputgroup-addon"
              style={{backgroundColor: 'var(--highlight-bg'}}
            >
              <i
                className="pi pi-unlock"
                style={{
                  color: 'var(--primary-color)'
                }}
              ></i>
            </span>
            <InputText
              className={isValidPassword ? '' : 'p-invalid'}
              placeholder="Digite a sua senha"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setIsValidPassword(true)
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
              className={isValidPassword ? '' : 'p-invalid'}
              placeholder="Digite a senha novamente"
              type="password"
              value={passwordConfirmation}
              onChange={(e) => {
                setPasswordConfirmation(e.target.value)
                setIsValidPassword(true)
              }}
            />
          </div>
        </div>
      </Card>
    </div>
  )
}
