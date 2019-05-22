```ts
declare namespace proxy {
  interface Proxy {
    id: string
    vmUuid: string
    name: string
  }

  function registerAppliance(_: { vmUuid: string; name: string }): Proxy
  function unRegisterAppliance(_: { id: string }): void
  function get(_: { id: string }): Proxy
  function getAll(): Proxy[]
  function update(_: Proxy): Proxy
}
```
