import type { AppType } from "next/app"
import { Providers } from "@/components/Providers"
import "@/app/globals.css"

const App: AppType = ({ Component, pageProps }) => {
  return (
    <Providers>
      <Component {...pageProps} />
    </Providers>
  )
}

export default App