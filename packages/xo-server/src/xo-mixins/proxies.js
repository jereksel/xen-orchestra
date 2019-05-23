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

  registerProxyAppliance(appliance) {
    return this._db.add(appliance).then(({ properties }) => properties)
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

  async updateProxy(id, props) {
    const proxy = await this.getProxy(id)
    patch(proxy, props)
    return this._db.update(proxy).then(({ properties }) => properties)
  }
}
