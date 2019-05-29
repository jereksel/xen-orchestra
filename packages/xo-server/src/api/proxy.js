export function registerAppliance(appliance) {
  return this.registerProxyAppliance(appliance)
}

registerAppliance.permission = 'admin'
registerAppliance.params = {
  address: {
    type: 'string',
  },
  name: {
    type: 'string',
    optional: true,
  },
  token: {
    type: 'string',
  },
}

export async function unRegisterAppliance({ id }) {
  await this.unRegisterProxyAppliance(id)
}

unRegisterAppliance.permission = 'admin'
unRegisterAppliance.params = {
  id: {
    type: 'string',
  },
}

export function get({ id }) {
  return this.getProxy(id)
}

get.permission = 'admin'
get.params = {
  id: {
    type: 'string',
  },
}

export function getAll() {
  return this.getAllProxies()
}

getAll.permission = 'admin'

export function update({ id, ...props }) {
  return this.updateProxy(id, props)
}

update.permission = 'admin'
update.params = {
  id: {
    type: 'string',
  },
  address: {
    type: 'string',
    optional: true,
  },
  name: {
    type: 'string',
    optional: true,
  },
  token: {
    type: 'string',
    optional: true,
  },
}
