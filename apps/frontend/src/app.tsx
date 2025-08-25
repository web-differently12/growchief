import { Layout } from "@growchief/frontend/components/layout/layout.tsx";
import useLocalStorage from "use-local-storage";
import { AuthLayout } from "@growchief/frontend/components/layout/auth.layout.tsx";

function App() {
  const [logged] = useLocalStorage("logged", "false");
  return logged === "false" ? <AuthLayout /> : <Layout />;
}

export default App;
