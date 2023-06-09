import {useEffect, useState} from 'react'
import useApi from '../../services/useApi'
import {DataTable} from 'primereact/datatable'
import {Column} from 'primereact/column'
import {InputText} from 'primereact/inputtext'
import {Button} from 'primereact/button'
import {ConfirmDialog, confirmDialog} from 'primereact/confirmdialog'

import {CustomerDialog} from './CustomerDialog.js'
import {EditCustomer} from './EditCustomer.js'
import {toast} from 'react-toastify'

export function CustomersDatatable(props) {
  const apiService = useApi()
  const [selectedRow, setSelectedRow] = useState({})
  const [customers, setCustomers] = useState([])
  const [customerToEdit, setCustomerToEdit] = useState({})
  const [filters, setFilters] = useState(null)
  const [loading, setLoading] = useState(false)
  const [globalFilterValue, setGlobalFilterValue] = useState('')
  const [customerDialog, setCustomerDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)

  const onGlobalFilterChange = (e) => {
    const value = e.target.value
    let _filters = {...filters}

    _filters['global'].value = value

    setFilters(_filters)
    setGlobalFilterValue(value)
  }
  async function loadCustomers() {
    setLoading(true)
    const lista = []
    const data = await apiService.get().then((response) => {
      return response.data || []
    })
    data.forEach((item) => {
      lista.push({
        id: item.id,
        name: item.name,
        birthDate: formatDate(item.birthDate),
        phone: item.phone.replace(/[^\w\s]/gi, '').replace(/\s/gi, ''),
        optionalPhone: item.optionalPhone
          .replace(/[^\w\s]/gi, '')
          .replace(/\s/gi, ''),
        cpf: item.cpf,
        gender: item.gender,
        createdBy: item.createdBy,
        cep: item.cep,
        logradouro: item.logradouro,
        houseNumber: item.houseNumber,
        bairro: item.bairro,
        complemento: item.complemento,
        cidade: item.cidade,
        uf: item.uf
      })
    })
    setCustomers(lista)
    setLoading(false)
  }

  useEffect(() => {
    loadCustomers()
  }, [])
  const renderHeader = () => {
    return (
      <div className="flex justify-content-between">
        <div className="flex align-items-center gap-3">
          <span className="text-xl">Selecionado: </span>
          <div className="flex gap-3">
            <p
              className="p-inputtext"
              style={{width: '300px', height: '40px'}}
            >
              {selectedRow?.name}
            </p>
            <p
              className="p-inputtext"
              style={{width: '300px', height: '40px'}}
            >
              {selectedRow?.birthDate}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            label="Novo"
            icon="pi pi-plus"
            iconPos="right"
            onClick={() => setCustomerDialog(!customerDialog)}
          />
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText
              value={globalFilterValue}
              onChange={onGlobalFilterChange}
              placeholder="Procurar na tabela"
            />
          </span>
        </div>
      </div>
    )
  }
  const header = renderHeader()

  const actionsTemplate = (data) => {
    return (
      <div className="flex justify-content-start">
        <Button
          className="transition-all transition-duration-300 hover:bg-primary-50"
          severity="info"
          icon="pi pi-user-edit"
          text
          rounded
          onClick={() => openEditDialog(data)}
        />
        <Button
          className="transition-all transition-duration-300 hover:bg-red-50"
          severity="danger"
          icon="pi pi-trash"
          rounded
          text
          onClick={() => confirmDelete(data)}
        />
      </div>
    )
  }

  const openEditDialog = (data) => {
    setCustomerToEdit(data)
    setShowEditDialog(true)
  }

  function confirmDelete(data) {
    confirmDialog({
      message: 'Tem certeza de que deseja excluir?',
      icon: 'pi pi-info-circle',
      header: 'Confirmar ação',
      acceptClassName: 'p-button-danger',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      accept: () => deleteCustomer(data),
      reject: false
    })
  }

  const deleteCustomer = async (data) => {
    await apiService
      .destroy(data.id)
      .then(() => {
        toast.info('Excluído com sucesso!')
        loadCustomers()
      })
      .catch((error) => toast.error('Falha ao excluir o cliente!'))
  }
  const formatDate = (value) => {
    const date = new Date(value)

    const dia = date.getDate().toString().padStart(2, '0')
    const mes = (date.getMonth() + 1).toString().padStart(2, '0')
    const ano = date.getFullYear().toString()

    const formatedDate = `${dia}/${mes}/${ano}`
    return formatedDate
  }
  return (
    <div style={props.style}>
      <CustomerDialog
        user={props.user}
        show={customerDialog}
        onClose={() => {
          setCustomerDialog(false)
          loadCustomers()
        }}
      />
      <EditCustomer
        user={props.user}
        customerToEdit={customerToEdit}
        show={showEditDialog}
        onClose={() => {
          setShowEditDialog(false)
          loadCustomers()
        }}
      />

      <ConfirmDialog />
      <DataTable
        header={header}
        loading={loading}
        value={customers}
        filters={filters}
        selectionMode="single"
        selection={selectedRow}
        onSelectionChange={(e) => setSelectedRow(e.value)}
        metaKeySelection={false}
        paginator
        resizableColumns
        showGridlines
        rows={10}
        rowClassName={'justify-content-center'}
        dataKey="id"
        filterDisplay="row"
        globalFilterFields={['name']}
        emptyMessage="Sem clientes cadastrados."
      >
        <Column
          sortable
          headerClassName="text-primary text-lg"
          field="name"
          header="Nome"
          alignHeader="center"
          filter
          filterPlaceholder="Buscar por nome..."
        />
        <Column
          header="Data de Nascimento"
          filterField="birthDate"
          field="birthDate"
          sortable
          headerClassName="text-primary text-lg"
          alignHeader="center"
          filter
        />
        <Column
          headerClassName="text-primary text-lg"
          field="phone"
          header="Telefone"
          alignHeader="center"
          filter
          filterField="phone"
          filterPlaceholder="Buscar por telefone..."
        />
        <Column
          headerClassName="text-primary text-lg"
          header="Ações"
          alignHeader="center"
          body={actionsTemplate}
        />
      </DataTable>
    </div>
  )
}
