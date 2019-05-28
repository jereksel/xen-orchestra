```ts
declare namespace proxy {
  interface Proxy {
    id: string
    name: string
    token: string
    vmUuid: string
  }

  function call(_: { id: string; method: string; params: object }): any
  function get(_: { id: string }): Proxy
  function getAll(): Proxy[]
  function registerAppliance(_: {
    name: string
    token: string
    vmUuid: string
  }): Proxy
  function unRegisterAppliance(_: { id: string }): void
  function update(_: Proxy): Proxy
}
```
