import {useState, useEffect} from 'react'
import {db} from '../../services/FirebaseServices'
import {collection, onSnapshot, query, orderBy} from 'firebase/firestore'

import {DataTable} from 'primereact/datatable'
import {FilterMatchMode} from 'primereact/api'
import {Column} from 'primereact/column'
import {InputText} from 'primereact/inputtext'
import {Button} from 'primereact/button'

import {CustomerDialog} from './CustomerDialog.js'
import {InputMask} from 'primereact/inputmask'

export function CustomersDatatable(props) {
  const [customers, setCustomers] = useState([])
  const [filters, setFilters] = useState({
    global: {value: null, matchMode: FilterMatchMode.CONTAINS},
    name: {value: null, matchMode: FilterMatchMode.STARTS_WITH},
    birthDate: {value: null, matchMode: FilterMatchMode.CONTAINS},
    phone: {value: null, matchMode: FilterMatchMode.CONTAINS}
  })
  const [loading, setLoading] = useState(false)
  const [globalFilterValue, setGlobalFilterValue] = useState('')
  const [customerDialog, setCustomerDialog] = useState(false)

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
            phone: doc.data().phone,
            cpf: doc.data().cpf,
            gender: doc.data().gender,
            address: doc.data().address
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
          onClick={() => editCustomer(data)}
        />
        <Button
          className="transition-all transition-duration-300 hover:bg-red-50"
          severity="danger"
          icon="pi pi-trash"
          rounded
          text
          onClick={() => editCustomer(data)}
        />
      </div>
    )
  }

  const editCustomer = (data) => {
    console.log(data)
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
      <DataTable
        header={header}
        loading={loading}
        value={customers}
        filters={filters}
        paginator
        rows={10}
        rowClassName={'justify-content-center'}
        dataKey="id"
        filterDisplay="row"
        globalFilterFields={['name']}
        emptyMessage="Sem clientes cadastrados."
      >
        <Column
          field="name"
          header="Nome"
          filter
          filterPlaceholder="Buscar por nome..."
        />
        <Column
          field="birthDate"
          header="Data de Nascimento"
          filter
          filterField="birthDate"
          filterPlaceholder="Buscar por data de nascimento..."
        />
        <Column
          field="phone"
          header="Telefone"
          filter
          filterField="phone"
          filterPlaceholder="Buscar por telefone..."
        />
        <Column
          header="Ações"
          body={actionsTemplate}
        />
      </DataTable>
    </div>
  )
}
