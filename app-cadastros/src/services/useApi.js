import axios from 'axios'

const resource = 'http://192.168.2.107:8088/contatos'

export default function useApi() {
  const get = () => {
    return axios.get(resource)
  }

  const show = (id) => {
    return axios.get(`${resource}/${id}`)
  }

  const create = (data) => {
    return axios.post(resource, data)
  }

  const update = (id, data) => {
    return axios.put(`${resource}/${id}`, data)
  }

  const destroy = (id) => {
    return axios.delete(`${resource}/${id}`)
  }

  return {
    get,
    show,
    create,
    update,
    destroy
  }
}
