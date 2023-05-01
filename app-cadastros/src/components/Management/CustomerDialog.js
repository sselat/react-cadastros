import {useState} from 'react'

import {InputText} from 'primereact/inputtext'
import {InputMask} from 'primereact/inputmask'
import {Button} from 'primereact/button'
import {Dialog} from 'primereact/dialog'

export function CustomerDialog(props) {
  const [customerName, setCustomerName] = useState('')
  const [customerCpf, setCustomerCpf] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerOptionalPhone, setCustomerOptionalPhone] = useState('')
  const [customerBirthDate, setCustomerBirthDate] = useState('')

  function closeDialog() {
    setCustomerName('')
    setCustomerPhone('')
    props.onClose()
  }

  return (
    <Dialog
      className="flex flex-column"
      header="Novo cadastro"
      visible={props.show}
      style={{width: '50vw'}}
      onHide={closeDialog}
      closable
    >
      <div className="mt-2 flex flex-column gap-2">
        <label htmlFor="name">Nome</label>
        <InputText
          style={{width: '100%'}}
          placeholder="Digite o seu nome completo"
          id="name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
        />
      </div>
      <div className="flex justify-content-between">
        <div className="mt-2 flex flex-column gap-2">
          <label htmlFor="cpf">CPF</label>
          <InputMask
            mask="999.999.999-99"
            placeholder="xxx.xxx.xxx-xx"
            id="cpf"
            value={customerCpf}
            onChange={(e) => setCustomerCpf(e.target.value)}
          />
        </div>
        <div className="mt-2 flex flex-column gap-2">
          <label htmlFor="birthDate">Nascimento</label>
          <InputMask
            mask="99/99/9999"
            placeholder="dd/mm/aaaa"
            id="birthDate"
            value={customerBirthDate}
            onChange={(e) => setCustomerBirthDate(e.target.value)}
          />
        </div>
      </div>
      <div className="flex justify-content-between">
        <div className="mt-2 flex flex-column gap-2">
          <label htmlFor="phone">Telefone</label>
          <InputMask
            mask="(99) - 999999999"
            placeholder="(xx) - xxxxxxxxx"
            style={{width: '100%'}}
            id="phone"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
          />
        </div>
        <div className="mt-2 flex flex-column gap-2">
          <label htmlFor="phone">Telefone para Recado</label>
          <InputMask
            mask="(99) - 999999999"
            placeholder="(xx) - xxxxxxxxx"
            style={{width: '100%'}}
            id="phone"
            value={customerOptionalPhone}
            onChange={(e) => setCustomerOptionalPhone(e.target.value)}
          />
        </div>
      </div>
      <Button
        icon="pi pi-check"
        onClick={() =>
          console.log(JSON.stringify(customerName + customerPhone))
        }
      />
    </Dialog>
  )
}
