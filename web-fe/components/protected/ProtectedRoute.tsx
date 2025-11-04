import { redirect } from "next/navigation";


function ProtectedRoute({children} : any) {
  const isAuthenticated = localStorage.getItem("token")
  if (!isAuthenticated) {
    redirect("/login");
  }
  return children;
}

export default ProtectedRoute