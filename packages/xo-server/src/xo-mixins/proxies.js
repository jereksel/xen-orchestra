import hrp from 'http-request-plus'
import { format, parse } from 'json-rpc-peer'
import { noSuchObject } from 'xo-common/api-errors'

import Collection from '../collection/redis'
import patch from '../patch'

const parseNdJson = (string, cb) => {
  const { length } = string
  let i = 0
  while (i < length) {
    let j = string.indexOf('\n', i)

    // no final \n
    if (j === -1) {
      j = length
    }

    // non empty line
    if (j !== i) {
      cb(JSON.parse(string.slice(i, j)))
    }

    i = j + 1
  }
}

export default class Proxy {
  constructor(app) {
    this._app = app
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

  async callThroughProxy(id, method, params) {
    // const app = this._app
    // const { vmUuid } = await this.getProxy(id)
    // const {
    //   addresses: { '0/ip': address },
    // } = app.getObject(vmUuid)
    // if (address === undefined) {
    //   throw new Error(`cannot get the vm address (${vmUuid})`)
    // }

    const url = 'http://127.0.0.1'
    return hrp
      .post(url, {
        body: format.request(0, method, params),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then(
        res =>
          new Promise((resolve, reject) => {
            const collection = []
            let consumed = false
            res.on('data', data => {
              if (!consumed) {
                consumed = true
                const { result } = parse(String(data))
                if (result.$responseType !== 'ndjson') {
                  resolve(result)
                }
                return
              }
              parseNdJson(data, item => {
                collection.push(item)
              })
            })
            res.on('error', error => {
              reject(error)
            })
            res.on('end', () => {
              resolve(collection)
            })
          })
      )
  }
}
