import {useState, useEffect} from 'react'
import {db} from '../../services/FirebaseServices'
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  deleteDoc
} from 'firebase/firestore'

import {DataTable} from 'primereact/datatable'
import {FilterMatchMode} from 'primereact/api'
import {Column} from 'primereact/column'
import {InputText} from 'primereact/inputtext'
import {Button} from 'primereact/button'
import {ConfirmDialog, confirmDialog} from 'primereact/confirmdialog'

import {CustomerDialog} from './CustomerDialog.js'
import {EditCustomer} from './EditCustomer.js'
import {toast} from 'react-toastify'

export function CustomersDatatable(props) {
  const [expandedRows, setExpandedRows] = useState(null)
  const [customers, setCustomers] = useState([])
  const [customerToEdit, setCustomerToEdit] = useState({})
  const [filters, setFilters] = useState({
    global: {value: null, matchMode: FilterMatchMode.CONTAINS},
    name: {value: null, matchMode: FilterMatchMode.CONTAINS},
    birthDate: {value: null, matchMode: FilterMatchMode.CONTAINS},
    phone: {value: null, matchMode: FilterMatchMode.CONTAINS}
  })
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

  useEffect(() => {
    setLoading(true)
    async function loadCustomers() {
      const tarefaRef = collection(db, 'clientes')
      const q = query(tarefaRef, orderBy('name', 'desc'))

      onSnapshot(q, (snapshot) => {
        const lista = []

        snapshot.forEach((doc) => {
          lista.push({
            id: doc.id,
            name: doc.data().name,
            birthDate: doc.data().birthDate,
            phone: doc
              .data()
              .phone.replace(/[^\w\s]/gi, '')
              .replace(/\s/gi, ''),
            optionalPhone: doc
              .data()
              .optionalPhone.replace(/[^\w\s]/gi, '')
              .replace(/\s/gi, ''),
            cpf: doc.data().cpf,
            gender: doc.data().gender,
            createdBy: doc.data().createdBy,
            cep: doc.data().cep,
            logradouro: doc.data().logradouro,
            houseNumber: doc.data().houseNumber,
            bairro: doc.data().bairro,
            complemento: doc.data().complemento,
            cidade: doc.data().cidade,
            uf: doc.data().uf,
            customGender: doc.data().customGender
          })
        })
        setCustomers(lista)
        setLoading(false)
      })
    }
    loadCustomers()
  }, [])

  const renderHeader = () => {
    return (
      <div className="flex justify-content-between">
        <div>
          <Button
            label="Cadastrar"
            icon="pi pi-plus"
            iconPos="right"
            onClick={() => setCustomerDialog(!customerDialog)}
          />
        </div>
        <div>
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
    const docRef = doc(db, 'clientes', data.id)
    await deleteDoc(docRef)
      .then(() => toast.info('Excluído com sucesso!'))
      .catch((error) => toast.error('Falha ao excluir o cliente!'))
  }

  // const birthDateFilter = () => {
  //   return (
  //     <InputMask
  //       mask="99/99/9999"
  //       value={filters.birthDate.value}
  //       onChange={(e) =>
  //         setFilters({
  //           ...filters,
  //           birthDate: {
  //             value: e.target.value,
  //             matchMode: FilterMatchMode.STARTS_WITH
  //           }
  //         })
  //       }
  //       style={{minWidth: '14rem'}}
  //     />
  //   )
  // }
  return (
    <div style={props.style}>
      <CustomerDialog
        show={customerDialog}
        onClose={() => setCustomerDialog(false)}
      />
      <EditCustomer
        customerToEdit={customerToEdit}
        show={showEditDialog}
        onClose={() => setShowEditDialog(false)}
      />

      <ConfirmDialog />
      <DataTable
        header={header}
        loading={loading}
        value={customers}
        filters={filters}
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
          sortable
          headerClassName="text-primary text-lg"
          field="birthDate"
          header="Data de Nascimento"
          alignHeader="center"
          filter
          filterField="birthDate"
          filterPlaceholder="Buscar por data de nascimento..."
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
