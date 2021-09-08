import { PropsWithChildren } from 'solid-js';
import { createContext, useContext } from 'solid-js';
import { store as globalStore } from './global';
import { store as roleStore } from './roles';

const appStore = globalStore;
const StoreContext = createContext(appStore);

export function StoreProvider(props: PropsWithChildren) {
  return <StoreContext.Provider value={appStore}>{props.children}</StoreContext.Provider>
}

export function useStore() {
  return useContext(StoreContext);
}
