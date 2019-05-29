import { noSuchObject } from 'xo-common/api-errors'

import Collection from '../collection/redis'
import patch from '../patch'

export default class Proxy {
  constructor(app) {
    const db = (this._db = new Collection({
      connection: app._redis,
      prefix: 'xo:proxy',
    }))

    app.on('clean', () => db.rebuildIndexes())
    app.on('start', () =>
      app.addConfigManager(
        'proxies',
        () => db.get(),
        proxies => db.update(proxies)
      )
    )
  }

  async registerProxyAppliance({ address, authenticationToken, name }) {
    const proxies = await this.getAllProxies()
    const proxy = proxies.find(proxy => proxy.address === address)
    if (proxy !== undefined) {
      throw new Error(
        `A proxy (${proxy.id}) with the address (${
          proxy.address
        }) is already registered.`
      )
    }

    const { properties } = await this._db.add({
      address,
      authenticationToken,
      name,
    })
    return properties
  }

  unRegisterProxyAppliance(id) {
    return this._db.remove(id)
  }

  async getProxy(id) {
    const proxy = await this._db.first(id)
    if (proxy === undefined) {
      throw noSuchObject(id, 'proxy')
    }
    return proxy.properties
  }

  getAllProxies() {
    return this._db.get()
  }

  async updateProxy(id, { address, authenticationToken, name }) {
    const proxy = await this.getProxy(id)
    patch(proxy, { address, authenticationToken, name })
    const { properties } = await this._db.update(proxy)
    return properties
  }
}
