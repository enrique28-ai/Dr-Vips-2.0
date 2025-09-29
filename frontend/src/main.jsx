import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {BrowserRouter} from "react-router-dom"
import { Toaster } from "react-hot-toast";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient.js";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import './index.css'
import App from './App.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <QueryClientProvider client={queryClient}>
    <App />
     <Toaster/>
     <ReactQueryDevtools initialIsOpen={false} />
     </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
)
