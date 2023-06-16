import {useState, useEffect, useRef} from 'react'
import useApi from '../../services/useApi'

import {InputText} from 'primereact/inputtext'
import {InputMask} from 'primereact/inputmask'
import {Button} from 'primereact/button'
import {Dialog} from 'primereact/dialog'
import {Toast} from 'primereact/toast'
import {RadioButton} from 'primereact/radiobutton'
import {Divider} from 'primereact/divider'

import {toast as toastify} from 'react-toastify'
import {Calendar} from 'primereact/calendar'

export function EditCustomer(props) {
  const apiService = useApi()
  const [customerDetails, setCustomerDetails] = useState({})
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
  const [addressFields, setAddressFields] = useState(true)
  const [isCepValid, setIsCepValid] = useState(true)
  const [isCpfValid, setIsCpfValid] = useState(true)
  const [customGender, setCustomGender] = useState(false)
  const [user, setUser] = useState({})

  const toast = useRef(null)

  const maxDate = new Date()
  const minDate = new Date('1900-01-01')

  useEffect(() => {
    function checarCep() {
      if (!customerDetails.cep) {
        setCustomerDetails((prevDetails) => ({
          ...prevDetails,
          logradouro: '',
          houseNumber: '',
          bairro: '',
          complemento: '',
          cidade: '',
          uf: ''
        }))
        setAddressFields(true)
        setIsCepValid(true)
      }
    }
    checarCep()
  }, [customerDetails.cep])

  useEffect(() => {
    setUser(props.user)
  }, [props.user])

  useEffect(() => {
    if (
      props.customerToEdit.gender !== 'Masculino' &&
      props.customerToEdit.gender !== 'Feminino'
    ) {
      setCustomGender(true)
    } else {
      setCustomGender(false)
    }
    setCustomerDetails({
      ...props.customerToEdit
    })
  }, [props.customerToEdit])

  async function editCustomer() {
    const customerInfo = {
      ...customerDetails,
      lastEditBy: user.email
    }
    await apiService
      .update(customerDetails.id, customerInfo)
      .then(() => {
        toastify.success('Cadastro atualizada!')
        closeDialog('edited')
      })
      .catch(() => toastify.error('Não foi possível realizar a ação!'))
  }

  function validarDados() {
    let hasError = false
    Object.keys(customerDetails).forEach((key) => {
      if (
        key !== 'optionalPhone' &&
        key !== 'complemento' &&
        customerDetails[key].length === 0
      ) {
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

  const validarCPF = (cpf) => {
    cpf = cpf.replace(/[^\d]+/g, '')
    if (cpf === '') return false
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false

    var soma = 0,
      resto

    for (let i = 1; i <= 9; i++) {
      soma = soma + parseInt(cpf.substring(i - 1, i)) * (11 - i)
    }
    resto = (soma * 10) % 11
    if (resto === 10 || resto === 11) resto = 0
    if (resto !== parseInt(cpf.substring(9, 10))) return false
    soma = 0
    for (let i = 1; i <= 10; i++) {
      soma = soma + parseInt(cpf.substring(i - 1, i)) * (12 - i)
    }
    resto = (soma * 10) % 11
    if (resto === 10 || resto === 11) resto = 0
    if (resto !== parseInt(cpf.substring(10, 11))) return false
    return true
  }

  function handleEdit() {
    resetColors()
    setIsCpfValid(true)
    const cpf = validarCPF(customerDetails.cpf)
    if (!cpf) {
      setIsCpfValid(false)
      showError('CPF Inválido!')
      return
    }

    const dados = validarDados()

    if (dados) {
      editCustomer()
    } else {
      showError('Verifique os campos obrigatórios!')
    }
  }
  function closeDialog(callback) {
    if (!callback) {
      setCustomerDetails({
        ...props.customerToEdit
      })
    }
    setIsCpfValid(true)
    setAddressFields(true)
    props.onClose()
  }

  function buscarCep() {
    if (!customerDetails.cep) {
      setIsCepValid(false)
      showError('CEP inválido!')
      return
    } else {
      setIsCepValid(true)
      const apiUrl = `https://viacep.com.br/ws/${customerDetails.cep}/json/`

      fetch(apiUrl)
        .then((response) => response.json())
        .then((data) => {
          if (data.erro) {
            showError('CEP inválido!')
          } else {
            preencherEndereco(data)
            setAddressFields(false)
          }
        })
    }
  }

  function preencherEndereco(data) {
    setCustomerDetails({
      ...customerDetails,
      logradouro: data.logradouro,
      bairro: data.bairro,
      cidade: data.localidade,
      uf: data.uf
    })
  }

  function footerButton() {
    return (
      <Button
        onClick={handleEdit}
        className="w-3 hover:bg-green-500"
        label="Atualizar"
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

  const formatBirthDate = (value) => {
    if (!value) return
    const date = new Date(value)

    const dia = date.getDate().toString().padStart(2, '0')
    const mes = (date.getMonth() + 1).toString().padStart(2, '0')
    const ano = date.getFullYear().toString()

    const formatedDate = `${dia}/${mes}/${ano}`
    return formatedDate
  }
  return (
    <Dialog
      className="flex flex-column"
      header="Editar cadastro"
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
        <label htmlFor="createdBy">Criado por</label>
        <InputText
          disabled
          id="createdBy"
          value={customerDetails.createdBy}
        />
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
            style={isCpfValid ? {} : {borderColor: 'var(--red-500)'}}
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
          <Calendar
            value={customerDetails.birthDate}
            onChange={(e) =>
              setCustomerDetails((prevState) => ({
                ...prevState,
                birthDate: e.target.value
              }))
            }
            minDate={minDate}
            maxDate={maxDate}
            dateFormat="dd/mm/yy"
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
              value={customerDetails.cep}
              onChange={(e) =>
                setCustomerDetails((prevState) => ({
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
            value={customerDetails.cidade}
            onChange={(e) =>
              setCustomerDetails((prevState) => ({
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
            value={customerDetails.uf}
            onChange={(e) =>
              setCustomerDetails((prevState) => ({
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
            value={customerDetails.logradouro}
            onChange={(e) =>
              setCustomerDetails((prevState) => ({
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
            value={customerDetails.houseNumber}
            onChange={(e) =>
              setCustomerDetails((prevState) => ({
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
          value={customerDetails.bairro}
          onChange={(e) =>
            setCustomerDetails((prevState) => ({
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
          value={customerDetails.complemento}
          onChange={(e) =>
            setCustomerDetails((prevState) => ({
              ...prevState,
              complemento: e.target.value
            }))
          }
        />
      </div>
    </Dialog>
  )
}
