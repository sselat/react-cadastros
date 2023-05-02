import {useState, useEffect, useRef} from 'react'
import {db} from '../../services/FirebaseServices'
import {addDoc, collection} from 'firebase/firestore'

import {InputText} from 'primereact/inputtext'
import {InputMask} from 'primereact/inputmask'
import {Button} from 'primereact/button'
import {Dialog} from 'primereact/dialog'
import {Toast} from 'primereact/toast'
import {RadioButton} from 'primereact/radiobutton'
import {Divider} from 'primereact/divider'

import {toast as toastify} from 'react-toastify'

export function CustomerDialog(props) {
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    cpf: '',
    birthDate: '',
    phone: '',
    optionalPhone: '',
    gender: 'Masculino'
  })
  const [customerAddress, setCustomerAddress] = useState({
    cep: '',
    logradouro: '',
    houseNumber: '',
    bairro: '',
    complemento: '',
    cidade: '',
    uf: ''
  })
  const [validInput, setValidInput] = useState({
    name: true,
    cpf: true,
    birthDate: true,
    phone: true,
    optionalPhone: true,
    gender: true,
    cep: true,
    logradouro: true,
    houseNumber: true,
    bairro: true,
    complemento: true,
    cidade: true,
    uf: true
  })
  const [addressFields, setAddresFields] = useState(true)
  const [isCepValid, setIsCepValid] = useState(true)
  const [customGender, setCustomGender] = useState(false)
  const [user, setUser] = useState({})

  const toast = useRef(null)

  useEffect(() => {
    function checarCep() {
      if (!customerAddress.cep) {
        setCustomerAddress({
          logradouro: '',
          houseNumber: '',
          bairro: '',
          complemento: '',
          cidade: '',
          uf: ''
        })
        setAddresFields(true)
        setIsCepValid(true)
      }
    }
    checarCep()
  }, [customerAddress.cep])
  useEffect(() => {
    function createCustomGender() {
      if (customGender) {
        setCustomerDetails((prevState) => ({
          ...prevState,
          gender: ''
        }))
      }
    }
    createCustomGender()
  }, [customGender])

  useEffect(() => {
    const userDetail = localStorage.getItem('@activeUser')
    setUser(JSON.parse(userDetail))
  }, [])

  async function registerCustomer() {
    const customerInfo = {
      ...customerDetails,
      ...customerAddress,
      customGender: customGender,
      createdBy: user
    }
    await addDoc(collection(db, 'clientes'), customerInfo)
      .then(() => {
        toastify.success('Cliente cadastrado com sucesso!')
        closeDialog()
      })
      .catch((error) => toastify.error(`Erro ao registrar: ${error}`))
  }
  function validarDados() {
    let hasError = false
    Object.keys(customerDetails).forEach((key) => {
      if (key !== 'optionalPhone' && customerDetails[key].length === 0) {
        hasError = true
        setValidInput((prevState) => ({...prevState, [key]: false}))
      }
    })
    if (hasError) {
      return false
    } else {
      return true
    }
  }
  const validarEndereco = () => {
    let hasError = false
    Object.keys(customerAddress).forEach((key) => {
      if (key !== 'complemento' && customerAddress[key].length === 0) {
        hasError = true
        setValidInput((prevState) => ({...prevState, [key]: false}))
      }
    })
    if (hasError) {
      return false
    } else {
      return true
    }
  }

  function resetColors() {
    const newValidInput = Object.keys(validInput).reduce((acc, key) => {
      acc[key] = true
      return acc
    }, {})
    setValidInput(newValidInput)
  }

  function handleSubmit() {
    resetColors()
    const dados = validarDados()
    const endereco = validarEndereco()

    if (dados && endereco) {
      registerCustomer()
    } else {
      showError('Verifique os campos obrigatórios!')
    }
  }
  function closeDialog() {
    resetColors()
    setCustomerDetails({
      name: '',
      cpf: '',
      birthDate: '',
      phone: '',
      optionalPhone: '',
      gender: 'Masculino'
    })
    setCustomerAddress({
      logradouro: '',
      houseNumber: '',
      bairro: '',
      complemento: '',
      cidade: '',
      uf: ''
    })
    setAddresFields(true)
    setCustomGender(false)
    props.onClose()
  }

  function buscarCep() {
    if (!customerAddress.cep) {
      setIsCepValid(false)
      showError('CEP inválido!')
      return
    } else {
      setIsCepValid(true)
      const apiUrl = `https://viacep.com.br/ws/${customerAddress.cep}/json/`

      fetch(apiUrl)
        .then((response) => response.json())
        .then((data) => {
          if (data.erro) {
            showError('CEP inválido!')
          } else {
            preencherEndereco(data)
            setAddresFields(false)
          }
        })
    }
  }

  function preencherEndereco(data) {
    setCustomerAddress({
      ...customerAddress,
      logradouro: data.logradouro,
      bairro: data.bairro,
      cidade: data.localidade,
      uf: data.uf
    })
  }

  function footerButton() {
    return (
      <Button
        onClick={handleSubmit}
        className="w-2 hover:bg-green-500"
        label="Salvar"
      />
    )
  }

  const showError = (msg) => {
    toast.current.show({
      severity: 'error',
      summary: 'Erro',
      detail: msg,
      life: 3000
    })
  }
  return (
    <Dialog
      className="flex flex-column"
      header="Novo cadastro"
      footer={footerButton}
      visible={props.show}
      style={{width: '50vw', maxWidth: '500px'}}
      onHide={closeDialog}
      closable
    >
      <Toast
        ref={toast}
        position="top-center"
      />
      <div className="mt-2 flex flex-column gap-2 relative w-12">
        <label htmlFor="name">
          Nome <span className="text-red-500">*</span>
        </label>
        <InputText
          style={validInput.name ? {} : {borderColor: 'var(--red-500)'}}
          placeholder="Digite o seu nome completo"
          id="name"
          value={customerDetails.name}
          onChange={(e) =>
            setCustomerDetails((prevState) => ({
              ...prevState,
              name: e.target.value
            }))
          }
        />
      </div>
      <div className="flex justify-content-between max-w-full">
        <div className="mt-2 flex flex-column gap-2 w-5">
          <label htmlFor="cpf">
            CPF <span className="text-red-500">*</span>
          </label>
          <InputMask
            style={validInput.cpf ? {} : {borderColor: 'var(--red-500)'}}
            mask="999.999.999-99"
            placeholder="xxx.xxx.xxx-xx"
            id="cpf"
            value={customerDetails.cpf}
            onChange={(e) =>
              setCustomerDetails((prevState) => ({
                ...prevState,
                cpf: e.target.value
              }))
            }
          />
        </div>
        <div className="mt-2 flex flex-column gap-2 w-5">
          <label htmlFor="birthDate">
            Nascimento <span className="text-red-500">*</span>
          </label>
          <InputMask
            style={validInput.birthDate ? {} : {borderColor: 'var(--red-500)'}}
            mask="99/99/9999"
            placeholder="dd/mm/aaaa"
            id="birthDate"
            value={customerDetails.birthDate}
            onChange={(e) =>
              setCustomerDetails((prevState) => ({
                ...prevState,
                birthDate: e.target.value
              }))
            }
          />
        </div>
      </div>
      <div className="flex justify-content-between gap-3 mt-3">
        <div className="flex align-items-center">
          <RadioButton
            inputId="m-gender"
            name="Masculino"
            value="Masculino"
            onChange={(e) => {
              setCustomGender(false)
              setCustomerDetails((prevState) => ({
                ...prevState,
                gender: e.target.value
              }))
            }}
            checked={customerDetails.gender === 'Masculino' && !customGender}
          />
          <label
            htmlFor="m-gender"
            className="ml-2"
          >
            Masculino
          </label>
        </div>
        <div className="flex align-items-center">
          <RadioButton
            inputId="f-gender"
            name="Feminino"
            value="Feminino"
            onChange={(e) => {
              setCustomGender(false)
              setCustomerDetails((prevState) => ({
                ...prevState,
                gender: e.target.value
              }))
            }}
            checked={customerDetails.gender === 'Feminino' && !customGender}
          />
          <label
            htmlFor="f-gender"
            className="ml-2"
          >
            Feminino
          </label>
        </div>
        <div className="flex align-items-center">
          <RadioButton
            inputId="c-gender"
            name="Personalizado"
            value="Personalizado"
            onChange={(e) => setCustomGender(true)}
            checked={customGender}
          />
          <label
            htmlFor="c-gender"
            className="ml-2"
          >
            Personalizado
          </label>
        </div>
      </div>
      <div className="flex justify-content-between mt-2">
        <InputText
          className="w-12"
          placeholder="Gênero (Opcional)"
          hidden={!customGender}
          value={customerDetails.gender}
          onChange={(e) =>
            setCustomerDetails((prevState) => ({
              ...prevState,
              gender: e.target.value
            }))
          }
        />
      </div>
      <div className="flex justify-content-between">
        <div className="mt-2 flex flex-column gap-2 w-5">
          <label htmlFor="phone">
            Telefone <span className="text-red-500">*</span>
          </label>
          <InputMask
            style={validInput.phone ? {} : {borderColor: 'var(--red-500)'}}
            mask="(99) 99999-9999"
            placeholder="(xx) xxxxx-xxxx"
            id="phone"
            value={customerDetails.phone}
            onChange={(e) =>
              setCustomerDetails((prevState) => ({
                ...prevState,
                phone: e.target.value
              }))
            }
          />
        </div>
        <div className="mt-2 flex flex-column gap-2 w-5">
          <label htmlFor="phone">Telefone 2</label>
          <InputMask
            mask="(99) 99999-9999"
            placeholder="(xx) xxxxx-xxxx"
            id="phone"
            value={customerDetails.optionalPhone}
            onChange={(e) =>
              setCustomerDetails((prevState) => ({
                ...prevState,
                optionalPhone: e.target.value
              }))
            }
          />
        </div>
      </div>
      <Divider
        style={{height: '1px', backgroundColor: 'var(--primary-color)'}}
      />
      <div className="flex justify-content-between">
        <div className="mt-2 flex flex-column gap-2 w-4">
          <label htmlFor="cep">
            CEP <span className="text-red-500">*</span>
          </label>
          <div className="flex relative">
            <InputMask
              className={isCepValid ? 'w-10' : 'w-10 p-invalid'}
              mask="99999-999"
              placeholder="12345-789"
              id="cep"
              value={customerAddress.cep}
              onChange={(e) =>
                setCustomerAddress((prevState) => ({
                  ...prevState,
                  cep: e.target.value
                }))
              }
            />
            <Button
              severity={isCepValid ? 'primary' : 'danger'}
              icon="pi pi-search"
              className="absolute w-2"
              style={{right: '16%'}}
              onClick={buscarCep}
            />
          </div>
        </div>
        <div className="mt-2 flex flex-column gap-2 w-5">
          <label htmlFor="cidade">
            Cidade <span className="text-red-500">*</span>
          </label>
          <InputText
            style={validInput.cidade ? {} : {borderColor: 'var(--red-500)'}}
            disabled={addressFields}
            keyfilter="int"
            id="cidade"
            value={customerAddress.cidade}
            onChange={(e) =>
              setCustomerAddress((prevState) => ({
                ...prevState,
                cidade: e.target.value
              }))
            }
          />
        </div>
        <div className="mt-2 flex flex-column gap-2 w-2">
          <label htmlFor="uf">
            UF <span className="text-red-500">*</span>
          </label>
          <InputText
            style={validInput.uf ? {} : {borderColor: 'var(--red-500)'}}
            disabled={addressFields}
            id="uf"
            value={customerAddress.uf}
            onChange={(e) =>
              setCustomerAddress((prevState) => ({
                ...prevState,
                uf: e.target.value
              }))
            }
          />
        </div>
      </div>
      <div className="flex justify-content-between">
        <div className="mt-2 flex flex-column gap-2 w-9">
          <label htmlFor="logradouro">
            Logradouro <span className="text-red-500">*</span>
          </label>
          <InputText
            style={validInput.logradouro ? {} : {borderColor: 'var(--red-500)'}}
            disabled={addressFields}
            id="logradouro"
            value={customerAddress.logradouro}
            onChange={(e) =>
              setCustomerAddress((prevState) => ({
                ...prevState,
                logradouro: e.target.value
              }))
            }
          />
        </div>
        <div className="mt-2 flex flex-column gap-2 w-2">
          <label htmlFor="houseNumber">
            Nº <span className="text-red-500">*</span>
          </label>
          <InputText
            style={
              validInput.houseNumber ? {} : {borderColor: 'var(--red-500)'}
            }
            disabled={addressFields}
            keyfilter="int"
            id="houseNumber"
            value={customerAddress.houseNumber}
            onChange={(e) =>
              setCustomerAddress((prevState) => ({
                ...prevState,
                houseNumber: e.target.value
              }))
            }
          />
        </div>
      </div>
      <div className="mt-2 flex flex-column gap-2 w-12">
        <label htmlFor="bairro">
          Bairro <span className="text-red-500">*</span>
        </label>
        <InputText
          style={validInput.bairro ? {} : {borderColor: 'var(--red-500)'}}
          disabled={addressFields}
          id="bairro"
          value={customerAddress.bairro}
          onChange={(e) =>
            setCustomerAddress((prevState) => ({
              ...prevState,
              bairro: e.target.value
            }))
          }
        />
      </div>
      <div className="flex flex-column gap-2 mt-2 w-12">
        <label htmlFor="complemento">Complemento</label>
        <InputText
          disabled={addressFields}
          id="complemento"
          value={customerAddress.complemento}
          onChange={(e) =>
            setCustomerAddress((prevState) => ({
              ...prevState,
              complemento: e.target.value
            }))
          }
        />
      </div>
    </Dialog>
  )
}
