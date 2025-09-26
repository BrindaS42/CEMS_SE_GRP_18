import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
<<<<<<< HEAD
import { Provider } from 'react-redux'
=======
import {Provider} from 'react-redux'
>>>>>>> fd6110422c3da3f77fd3278634fcd0ae7b52e139
import {store} from './Store/index.js'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
<<<<<<< HEAD
    <Provider store={store}>
      <App />
    </Provider>
=======
    <Provider store = {store}>
       <App />

    </Provider>
  
>>>>>>> fd6110422c3da3f77fd3278634fcd0ae7b52e139
  </StrictMode>,
)

